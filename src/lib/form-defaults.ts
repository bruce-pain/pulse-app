import type { Form, FormQuestion, QuestionType } from "@/types/form";

export const QUESTION_TYPES: {
  type: QuestionType;
  label: string;
  hint: string;
}[] = [
  { type: "short_text", label: "Short text", hint: "255 characters" },
  { type: "long_text", label: "Long text", hint: "2,000 characters" },
  { type: "multiple_choice", label: "Multiple choice", hint: "One or many" },
  { type: "rating", label: "Rating", hint: "Scale of 1 to 5" },
  { type: "file_upload", label: "File upload", hint: "5 MB max" },
];

export function typeLabel(type: QuestionType) {
  return QUESTION_TYPES.find((t) => t.type === type)?.label ?? type;
}

export function createQuestion(type: QuestionType): FormQuestion {
  const base = {
    id: crypto.randomUUID(),
    type,
    label: "",
    required: false,
    help_text: "",
  };

  switch (type) {
    case "short_text":
      return { ...base, config: { max_length: 255 } };
    case "long_text":
      return { ...base, config: { max_length: 2000 } };
    case "multiple_choice":
      return {
        ...base,
        config: { options: ["", ""], allow_multiple_answers: false },
      };
    case "rating":
      return { ...base, config: { min: 1, max: 5 } };
    case "file_upload":
      return {
        ...base,
        config: {
          max_file_size_mb: 5,
          allowed_file_types: ["pdf", "doc", "docx"],
        },
      };
  }
}

export function createEmptyForm(): Form {
  return {
    form_id: crypto.randomUUID(),
    version: 1,
    title: "",
    description: "",
    type: "survey",
    status: "draft",
    settings: { anonymous: false, one_response: false, deadline: null },
    questions: [],
  };
}
