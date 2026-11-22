import type {
  Form,
  FormQuestion,
  FormResponse,
  FormStatus,
  FormType,
  QuestionType,
  SubmitAnswer,
} from "@/types/form";

/*
 * Translators between the backend's shapes (Swagger + what the live API
 * actually returns) and the shapes our components use.
 *
 * This is the ONLY file that knows both. If the backend renames a field,
 * fix it here and nothing else changes.
 */

/* ---------- API shapes (what the server sends/receives) ---------- */

type ApiFormType = "FEEDBACK" | "APPLICATION" | "POLL" | "SURVEY";
type ApiFormStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
type ApiQuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "MULTIPLE_CHOICE"
  | "RATING"
  | "FILE_UPLOAD";

export interface ApiFormSettings {
  allowAnonymous?: boolean;
  one_response?: boolean;
  deadline?: string | null; // ISO date-time
  thankYouMessage?: string;
  [key: string]: unknown; // keep anything else the backend stores
}

export interface ApiForm {
  id: string;
  title: string;
  description: string | null;
  type: ApiFormType;
  status: ApiFormStatus;
  slug?: string | null;
  settings: ApiFormSettings | null;
  version: number;
  createdAt?: string;
  questions?: ApiQuestion[]; // only on GET /forms/share/{slug}
}

export interface ApiQuestionConfig {
  maxLength?: number;
  placeholder?: string;
  options?: string[];
  allowMultiple?: boolean;
  min?: number;
  max?: number;
  maxSizeMb?: number;
  allowedTypes?: string[];
}

export interface ApiQuestion {
  id: string;
  formId?: string;
  type: ApiQuestionType;
  label: string;
  helpText: string | null;
  required: boolean;
  config: ApiQuestionConfig | null;
  position?: number;
}

export interface ApiResponse {
  id: string;
  formId: string;
  submittedAt: string;
  answers: { questionId: string; value: unknown }[];
}

export interface ApiPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/* ---------- Enum maps ---------- */

const formTypeFromApi: Record<ApiFormType, FormType> = {
  FEEDBACK: "feedback",
  APPLICATION: "job_application",
  POLL: "poll",
  SURVEY: "survey",
};
const formTypeToApi: Record<FormType, ApiFormType> = {
  feedback: "FEEDBACK",
  job_application: "APPLICATION",
  poll: "POLL",
  survey: "SURVEY",
};

// SHORT_TEXT <-> short_text: same words, different case
const questionTypeFromApi = (t: ApiQuestionType) => t.toLowerCase() as QuestionType;
const questionTypeToApi = (t: QuestionType) => t.toUpperCase() as ApiQuestionType;

export const formStatusToApi = (s: FormStatus) => s.toUpperCase() as ApiFormStatus;
const formStatusFromApi = (s: ApiFormStatus) => s.toLowerCase() as FormStatus;

/* ---------- Dates ---------- */

// "2026-12-31T22:59:59.000Z" -> "2026-12-31" (in the user's own timezone)
function isoToLocalDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "2026-12-31" -> end of that day in the user's timezone, as ISO
function localDateToIso(date: string): string {
  return new Date(`${date}T23:59:59`).toISOString();
}

/* ---------- Questions ---------- */

export function questionFromApi(q: ApiQuestion): FormQuestion {
  const c = q.config ?? {};
  const config: FormQuestion["config"] = {};
  if (c.maxLength !== undefined) config.max_length = c.maxLength;
  if (c.options) config.options = c.options;
  if (c.allowMultiple !== undefined) config.allow_multiple_answers = c.allowMultiple;
  if (c.min !== undefined) config.min = c.min;
  if (c.max !== undefined) config.max = c.max;
  if (c.maxSizeMb !== undefined) config.max_file_size_mb = c.maxSizeMb;
  if (c.allowedTypes) config.allowed_file_types = c.allowedTypes;

  return {
    id: q.id,
    type: questionTypeFromApi(q.type),
    label: q.label,
    required: q.required,
    help_text: q.helpText ?? undefined,
    config,
  };
}

/** Body for POST /forms/{id}/questions and PATCH .../questions/{id} */
export function questionToApi(q: FormQuestion) {
  const c = q.config ?? {};
  const config: ApiQuestionConfig = {};

  switch (q.type) {
    case "short_text":
    case "long_text":
      if (c.max_length) config.maxLength = c.max_length;
      break;
    case "multiple_choice":
      config.options = c.options ?? [];
      config.allowMultiple = c.allow_multiple_answers ?? false;
      break;
    case "rating":
      config.min = c.min ?? 1;
      config.max = c.max ?? 5;
      break;
    case "file_upload":
      config.maxSizeMb = c.max_file_size_mb ?? 5;
      config.allowedTypes = (c.allowed_file_types ?? []).map((t) =>
        t.replace(/^\./, "").toLowerCase(),
      );
      break;
  }

  return {
    type: questionTypeToApi(q.type),
    label: q.label,
    helpText: q.help_text || undefined,
    required: q.required,
    config,
  };
}

/* ---------- Forms ---------- */

export function formFromApi(api: ApiForm, questions: ApiQuestion[] = []): Form {
  const s = api.settings ?? {};
  const ordered = [...questions].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );

  return {
    form_id: api.id,
    version: api.version,
    title: api.title,
    description: api.description ?? undefined,
    type: formTypeFromApi[api.type] ?? "survey",
    status: formStatusFromApi(api.status),
    settings: {
      anonymous: s.allowAnonymous ?? false,
      one_response: s.one_response ?? false,
      deadline: s.deadline ? isoToLocalDate(s.deadline) : null,
      thank_you_message: s.thankYouMessage,
    },
    questions: ordered.map(questionFromApi),
    share_slug: api.slug ?? undefined,
    created_at: api.createdAt,
  };
}

/** Body for POST /forms and PATCH /forms/{id} (questions are sent separately) */
export function formToApi(form: Form) {
  const settings: ApiFormSettings = {
    allowAnonymous: form.settings.anonymous,
    one_response: form.settings.one_response,
    deadline: form.settings.deadline ? localDateToIso(form.settings.deadline) : null,
  };
  if (form.settings.thank_you_message) {
    settings.thankYouMessage = form.settings.thank_you_message;
  }

  return {
    title: form.title,
    description: form.description || undefined,
    type: formTypeToApi[form.type],
    settings,
  };
}

/* ---------- Responses ---------- */

export function responseFromApi(r: ApiResponse): FormResponse {
  return {
    id: r.id,
    form_id: r.formId,
    submitted_at: r.submittedAt,
    answers: r.answers.map((a) => ({
      questionId: a.questionId,
      value: a.value as SubmitAnswer["value"],
    })),
  };
}
