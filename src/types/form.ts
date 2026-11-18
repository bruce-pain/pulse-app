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
  deadline: string | null;
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
}
