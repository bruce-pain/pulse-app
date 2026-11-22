import { ApiError } from "@/lib/api-client";
import { mockForms, mockResponses } from "@/lib/mock-data";
import { validateAnswer } from "@/lib/response-validation";
import type {
  Form,
  FormResponse,
  FormStatus,
  SubmitAnswer,
} from "@/types/form";

/*
 * A fake backend that keeps its data in localStorage, so forms and responses
 * survive reloads and are shared between tabs (e.g. the builder in one tab,
 * the public form opened from "Open the form" in another).
 * Errors are thrown in the same shape the real API uses (ApiError + details).
 */

const FORMS_KEY = "pulse_mock_forms";
const RESPONSES_KEY = "pulse_mock_responses";

function read<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : seed;
  } catch {
    return seed;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the change only lives until reload
  }
}

const loadForms = () => read<Form[]>(FORMS_KEY, mockForms);
const saveForms = (forms: Form[]) => write(FORMS_KEY, forms);
const loadResponses = () => read<FormResponse[]>(RESPONSES_KEY, mockResponses);
const saveResponses = (r: FormResponse[]) => write(RESPONSES_KEY, r);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "form"
  );
}

/* ---------- Forms ---------- */

export async function getForms(): Promise<Form[]> {
  return loadForms();
}

export async function getFormById(id: string): Promise<Form | undefined> {
  return loadForms().find((form) => form.form_id === id);
}

export async function getFormsByStatus(status: FormStatus): Promise<Form[]> {
  return loadForms().filter((form) => form.status === status);
}

export async function searchForms(searchTerm: string): Promise<Form[]> {
  const query = searchTerm.trim().toLowerCase();
  const forms = loadForms();
  if (!query) return forms;
  return forms.filter((form) => form.title.toLowerCase().includes(query));
}

export async function createForm(form: Form): Promise<Form> {
  saveForms([...loadForms(), form]);
  return form;
}

export async function updateForm(
  id: string,
  updates: Partial<Form>,
): Promise<Form | undefined> {
  const forms = loadForms();
  const index = forms.findIndex((form) => form.form_id === id);
  if (index === -1) return undefined;

  forms[index] = { ...forms[index], ...updates };
  saveForms(forms);
  return forms[index];
}

export async function deleteForm(id: string): Promise<boolean> {
  const forms = loadForms();
  const next = forms.filter((form) => form.form_id !== id);
  if (next.length === forms.length) return false;
  saveForms(next);
  return true;
}

/** Like POST /forms/{id}/publish — repeated calls keep the same slug. */
export async function publishForm(id: string): Promise<Form> {
  const forms = loadForms();
  const form = forms.find((f) => f.form_id === id);
  if (!form) throw new ApiError("Form not found", 404);
  if (form.status === "closed") {
    throw new ApiError("A closed form cannot be published", 400);
  }

  const taken = new Set(forms.map((f) => f.share_slug).filter(Boolean));
  let slug = form.share_slug;
  if (!slug) {
    slug = slugify(form.title);
    // Make it unique: "retro", "retro-2", "retro-3"...
    for (let n = 2; taken.has(slug); n++) slug = `${slugify(form.title)}-${n}`;
  }

  return (await updateForm(id, { status: "published", share_slug: slug }))!;
}

/** Like GET /forms/share/{slug}. Closed forms are returned so we can say so. */
export async function getFormBySlug(slug: string): Promise<Form> {
  const form = loadForms().find(
    (f) => f.share_slug === slug && f.status !== "draft",
  );
  if (!form) throw new ApiError("Form not found", 404);
  return form;
}

/* ---------- Responses ---------- */

/** Like the upload endpoint, minus actually storing the file. */
export async function uploadFileAnswer(file: File) {
  await wait(400);
  return { name: file.name, size: file.size, type: file.type };
}

/** Like POST /forms/{formId}/responses, including its 400 error format. */
export async function submitResponse(
  formId: string,
  answers: SubmitAnswer[],
): Promise<FormResponse> {
  await wait(500); // feel like a network request, so loading states show

  const form = await getFormById(formId);
  if (!form) throw new ApiError("Form not found", 404);
  if (form.status !== "published") {
    throw new ApiError("This form is not accepting responses", 400);
  }

  // Server-side validation, reported like the real API:
  // "Question <id> (<label>): <message>"
  const details: string[] = [];
  for (const question of form.questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    const problem = validateAnswer(question, answer?.value ?? null);
    if (problem) {
      details.push(`Question ${question.id} (${question.label}): ${problem}`);
    }
  }
  if (details.length > 0) {
    throw new ApiError("Validation failed", 400, details);
  }

  const response: FormResponse = {
    id: crypto.randomUUID(),
    form_id: formId,
    submitted_at: new Date().toISOString(),
    answers,
  };
  saveResponses([...loadResponses(), response]);
  return response;
}

export async function getFormResponses(formId: string): Promise<FormResponse[]> {
  return loadResponses()
    .filter((r) => r.form_id === formId)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
}
