export type FormStatus = "draft" | "published" | "closed";

export type FormType = "feedback" | "job_application" | "poll" | "survey";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "rating"
  | "file_upload";

export interface FormSettings {
  anonymous: boolean;
  one_response: boolean;
  deadline: string | null; // "YYYY-MM-DD"
  /** Shown on the confirmation screen after submitting */
  thank_you_message?: string;
}

export interface FormQuestion {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  help_text?: string;
  config?: {
    min?: number;
    max?: number;
    options?: string[];
    max_length?: number;
    max_file_size_mb?: number;
    allowed_file_types?: string[];
    allow_multiple_answers?: boolean;
  };
}

export interface Form {
  form_id: string;
  version: number;
  title: string;
  description?: string;
  type: FormType;
  status: FormStatus;
  settings: FormSettings;
  questions: FormQuestion[];
  /** Set when the form is published. Public link: /f/{share_slug} */
  share_slug?: string;
  created_at?: string; // ISO date
}

/* ---------- Responses ---------- */

/**
 * An attached file. The file itself is uploaded first
 * (POST /forms/{formId}/questions/{questionId}/files); the answer holds
 * the reference the upload returns.
 */
export interface FileAnswer {
  name: string;
  size: number; // bytes
  /** Signed link returned by the upload endpoint (absent in preview/mock) */
  url?: string;
  type?: string; // MIME type, only known for files picked in this browser
}

/**
 * What one answer holds, by question type:
 * short/long text → string, single choice → string, multi choice → string[],
 * rating → number, file upload → FileAnswer[]. null = not answered.
 */
export type AnswerValue = string | string[] | number | FileAnswer[] | null;

// Mirrors the API's SubmitAnswerDto: { questionId, value }
export interface SubmitAnswer {
  questionId: string;
  value: Exclude<AnswerValue, null>;
}

export interface FormResponse {
  id: string;
  form_id: string;
  submitted_at: string; // ISO date
  answers: SubmitAnswer[];
}
