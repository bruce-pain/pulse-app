import { createEmptyForm, createQuestion } from "@/lib/form-defaults";
import type { Form, FormQuestion, QuestionType } from "@/types/form";

export type TemplateId = "feedback" | "job_application" | "poll";

export type Template = {
  id: TemplateId;
  description: string;
  build: () => Form;
};

// Small helper: a default question of this type, with a label and any overrides
function q(
  type: QuestionType,
  label: string,
  extra: Partial<FormQuestion> = {},
): FormQuestion {
  const base = createQuestion(type);
  return {
    ...base,
    ...extra,
    label,
    config: { ...base.config, ...extra.config },
  };
}

// "YYYY-MM-DD" a number of days from today
function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const TEMPLATES: Template[] = [
  {
    id: "feedback",
    description:
      "Anonymous by default, sentiment on. For retros and pulse checks.",
    build: () => ({
      ...createEmptyForm(),
      title: "Team feedback",
      type: "feedback",
      settings: { anonymous: true, one_response: false, deadline: null },
      questions: [
        q("rating", "How was the sprint overall?", {
          required: true,
          help_text: "1 is rough, 5 is great.",
        }),
        q("long_text", "What went well?"),
        q("long_text", "What slowed us down?", { required: true }),
        q("multiple_choice", "Which area needs the most attention?", {
          required: true,
          help_text: "Pick the one that cost the team most time.",
          config: { options: ["Tooling", "Scope", "Reviews", "Testing"] },
        }),
        q("short_text", "Anything you want to flag to leads?"),
      ],
    }),
  },
  {
    id: "job_application",
    description: "Name, email and CV upload. One response per email.",
    build: () => ({
      ...createEmptyForm(),
      title: "Job application",
      type: "job_application",
      settings: { anonymous: false, one_response: true, deadline: null },
      questions: [
        q("short_text", "Full name", { required: true }),
        q("short_text", "Email address", { required: true }),
        q("short_text", "Phone number"),
        q("short_text", "Role you are applying for", { required: true }),
        q("long_text", "Why do you want to join us?", { required: true }),
        q("file_upload", "Upload your CV", {
          required: true,
          help_text: "PDF, DOC or DOCX, up to 5 MB.",
        }),
        q("long_text", "Anything else we should know?"),
      ],
    }),
  },
  {
    id: "poll",
    description: "One response per person, with a deadline.",
    build: () => ({
      ...createEmptyForm(),
      title: "Team poll",
      type: "poll",
      settings: {
        anonymous: false,
        one_response: true,
        deadline: daysFromNow(7),
      },
      questions: [
        q("multiple_choice", "Which option gets your vote?", {
          required: true,
          config: { options: ["Option A", "Option B", "Option C"] },
        }),
        q("rating", "How strongly do you feel about it?"),
        q("short_text", "Any comments?"),
      ],
    }),
  },
];

export const TEMPLATE_NAMES: Record<TemplateId, string> = {
  feedback: "Feedback",
  job_application: "Job application",
  poll: "Poll",
};

export function isTemplateId(value: string): value is TemplateId {
  return TEMPLATES.some((t) => t.id === value);
}

export function createFormFromTemplate(id: TemplateId): Form {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) throw new Error(`Unknown template: ${id}`);
  return template.build();
}
