"use client";

import { RespondentForm } from "@/components/respondent/respondent-form";
import type { Form } from "@/types/form";

// Dev page: every question type, rendered and validated exactly as
// respondents get them (preview mode = nothing is sent).
const testForm: Form = {
  form_id: "question-test",
  version: 1,
  title: "Question Component Test",
  description: "Testing all five Pulse question types.",
  type: "survey",
  status: "draft",
  settings: { anonymous: false, one_response: false, deadline: null },
  questions: [
    { id: "q1", type: "short_text", label: "What is your name?", required: true, config: { max_length: 255 } },
    {
      id: "q2",
      type: "long_text",
      label: "What can we improve?",
      required: true,
      help_text: "Share your thoughts with us.",
      config: { max_length: 2000 },
    },
    {
      id: "q3",
      type: "multiple_choice",
      label: "Which department are you in?",
      required: true,
      config: { options: ["Engineering", "Design", "Marketing", "HR"], allow_multiple_answers: false },
    },
    {
      id: "q3b",
      type: "multiple_choice",
      label: "Which tools do you use?",
      required: false,
      config: { options: ["Figma", "VS Code", "Jira"], allow_multiple_answers: true },
    },
    { id: "q4", type: "rating", label: "How would you rate your experience?", required: true, config: { min: 1, max: 5 } },
    {
      id: "q5",
      type: "file_upload",
      label: "Upload a supporting document",
      required: false,
      config: { max_file_size_mb: 5, allowed_file_types: [".pdf", ".doc", ".docx"] },
    },
  ],
};

export default function QuestionTestPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <RespondentForm form={testForm} mode="preview" />
    </main>
  );
}
