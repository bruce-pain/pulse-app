import * as mock from "@/lib/mock-api";
import { ApiError, apiDownload, apiRequest } from "@/lib/api-client";
import {
  formFromApi,
  formToApi,
  questionToApi,
  responseFromApi,
  type ApiForm,
  type ApiPage,
  type ApiQuestion,
  type ApiResponse,
} from "@/lib/api-mappers";
import type { FileAnswer, Form, FormResponse, SubmitAnswer } from "@/types/form";

/*
 * The single place components get form data from.
 * NEXT_PUBLIC_USE_MOCK_API=true  → fake backend in localStorage (offline dev)
 * NEXT_PUBLIC_USE_MOCK_API=false → the real API (Swagger: /api)
 * Shapes are translated in api-mappers.ts, so components never see API names.
 */
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

/* ---------- Reading forms ---------- */

/**
 * GET /forms. The list endpoint does not include questions, so
 * `questions` is empty here — load a single form to get them.
 */
export async function getForms(): Promise<Form[]> {
  if (USE_MOCK_API) return mock.getForms();
  const forms = await apiRequest<ApiForm[]>("/forms");
  return forms.map((f) => formFromApi(f));
}

/** GET /forms/{id} + GET /forms/{id}/questions, in parallel. */
export async function getFormById(id: string): Promise<Form | undefined> {
  if (USE_MOCK_API) return mock.getFormById(id);
  try {
    const [form, questions] = await Promise.all([
      apiRequest<ApiForm>(`/forms/${id}`),
      apiRequest<ApiQuestion[]>(`/forms/${id}/questions`),
    ]);
    return formFromApi(form, questions);
  } catch (err) {
    // 404 = no such form; 400 = id is not a valid UUID
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return undefined;
    }
    throw err;
  }
}

/* ---------- Saving forms (builder) ---------- */

/**
 * Makes the server's questions match the builder's, in order:
 * edit the ones that exist, add the new ones, delete the removed ones,
 * then send the final order.
 */
async function syncQuestions(formId: string, form: Form): Promise<void> {
  const serverQuestions = await apiRequest<ApiQuestion[]>(`/forms/${formId}/questions`);
  const serverIds = new Set(serverQuestions.map((q) => q.id));
  const keptIds = new Set(form.questions.map((q) => q.id));

  // One at a time, in order, so new questions are appended in the right order
  const finalIds: string[] = [];
  for (const question of form.questions) {
    const body = JSON.stringify(questionToApi(question));
    if (serverIds.has(question.id)) {
      await apiRequest(`/forms/${formId}/questions/${question.id}`, { method: "PATCH", body });
      finalIds.push(question.id);
    } else {
      // New in the builder: the server assigns the real id
      const created = await apiRequest<ApiQuestion>(`/forms/${formId}/questions`, {
        method: "POST",
        body,
      });
      finalIds.push(created.id);
    }
  }

  for (const q of serverQuestions) {
    if (!keptIds.has(q.id)) {
      await apiRequest(`/forms/${formId}/questions/${q.id}`, { method: "DELETE" });
    }
  }

  if (finalIds.length > 1) {
    await apiRequest(`/forms/${formId}/questions/order`, {
      method: "PATCH",
      body: JSON.stringify({ questionIds: finalIds }),
    });
  }
}

/** POST /forms, then add each question. Returns the saved form with server ids. */
export async function createForm(form: Form): Promise<Form> {
  if (USE_MOCK_API) return mock.createForm(form);

  const created = await apiRequest<ApiForm>("/forms", {
    method: "POST",
    body: JSON.stringify(formToApi(form)),
  });
  await syncQuestions(created.id, form);
  return (await getFormById(created.id))!;
}

/** PATCH /forms/{id}, then sync questions if they were part of the update. */
export async function updateForm(id: string, updates: Partial<Form>): Promise<Form | undefined> {
  if (USE_MOCK_API) return mock.updateForm(id, updates);

  const current = await getFormById(id);
  if (!current) return undefined;
  const next: Form = { ...current, ...updates };

  await apiRequest(`/forms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(formToApi(next)),
  });
  if (updates.questions) await syncQuestions(id, next);
  return getFormById(id);
}

/** DELETE /forms/{id} (soft delete: responses are kept) */
export async function deleteForm(id: string): Promise<boolean> {
  if (USE_MOCK_API) return mock.deleteForm(id);
  await apiRequest(`/forms/${id}`, { method: "DELETE" });
  return true;
}

/**
 * POST /forms/{id}/publish → { id, status, slug }.
 * Repeated calls keep the same slug, so this is also how we get the
 * share link for a published form whose slug we don't have yet.
 */
export async function publishForm(id: string): Promise<Form> {
  if (USE_MOCK_API) return mock.publishForm(id);
  await apiRequest(`/forms/${id}/publish`, { method: "POST" });
  return (await getFormById(id))!;
}

/* ---------- Public form + responses ---------- */

/** GET /forms/share/{slug} — public; includes the ordered questions. */
export async function getFormBySlug(slug: string): Promise<Form> {
  if (USE_MOCK_API) return mock.getFormBySlug(slug);
  const form = await apiRequest<ApiForm>(`/forms/share/${encodeURIComponent(slug)}`, {
    auth: false,
  });
  return formFromApi(form, form.questions ?? []);
}

/**
 * POST /forms/{formId}/questions/{questionId}/files (multipart).
 * Returns { name, url, size } to put in the answer when submitting.
 * The token is sent if the person is signed in (needed for non-anonymous forms).
 */
export async function uploadFileAnswer(
  formId: string,
  questionId: string,
  file: File,
): Promise<FileAnswer> {
  if (USE_MOCK_API) return mock.uploadFileAnswer(file);
  const body = new FormData();
  body.append("file", file);
  const uploaded = await apiRequest<{ name: string; url: string; size: number }>(
    `/forms/${formId}/questions/${questionId}/files`,
    { method: "POST", body },
  );
  return { ...uploaded, type: file.type };
}

/**
 * POST /forms/{formId}/responses — body = SubmitResponseDto.
 * The token is sent if the person is signed in: the API requires it for
 * non-anonymous or one-response-per-person forms.
 */
export async function submitResponse(
  formId: string,
  answers: SubmitAnswer[],
): Promise<FormResponse> {
  if (USE_MOCK_API) return mock.submitResponse(formId, answers);

  // File answers: send only what the API asked for ({ name, url, size })
  const cleaned = answers.map((a) =>
    Array.isArray(a.value) && typeof a.value[0] === "object"
      ? { ...a, value: (a.value as FileAnswer[]).map(({ name, url, size }) => ({ name, url, size })) }
      : a,
  );

  const saved = await apiRequest<ApiResponse>(`/forms/${formId}/responses`, {
    method: "POST",
    body: JSON.stringify({ answers: cleaned }),
  });
  return responseFromApi(saved);
}

/** GET /forms/{formId}/responses, every page (100 per request), newest first. */
export async function getFormResponses(formId: string): Promise<FormResponse[]> {
  if (USE_MOCK_API) return mock.getFormResponses(formId);

  const all: ApiResponse[] = [];
  for (let page = 1; page <= 50; page++) {
    const result = await apiRequest<ApiPage<ApiResponse>>(
      `/forms/${formId}/responses?page=${page}&limit=100`,
    );
    all.push(...result.items);
    if (page >= result.pagination.totalPages) break;
  }
  return all
    .map(responseFromApi)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
}

/** GET /forms/{formId}/responses/export.csv — saves the file. */
export async function exportResponsesCsv(formId: string, title: string): Promise<void> {
  if (USE_MOCK_API) throw new Error("Export needs the real API.");
  const safeName = title.replace(/[^\w-]+/g, "-").toLowerCase() || "responses";
  await apiDownload(`/forms/${formId}/responses/export.csv`, `${safeName}.csv`);
}
