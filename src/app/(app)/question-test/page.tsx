import { QuestionRenderer } from "@/components/questions/question-registry";
import type { FormQuestion } from "@/types/form";

const sampleQuestions: FormQuestion[] = [
  {
    id: "q1",
    type: "short_text",
    label: "What is your name?",
    required: true,
  },
  {
    id: "q2",
    type: "long_text",
    label: "What can we improve?",
    required: true,
    help_text: "Share your thoughts with us.",
  },
  {
    id: "q3",
    type: "multiple_choice",
    label: "Which department are you in?",
    required: true,
    config: {
      options: ["Engineering", "Design", "Marketing", "HR"],
      allow_multiple_answers: false,
    },
  },
  {
    id: "q4",
    type: "rating",
    label: "How would you rate your experience?",
    required: true,
    config: {
      min: 1,
      max: 5,
    },
  },
  {
    id: "q5",
    type: "file_upload",
    label: "Upload a supporting document",
    required: false,
    config: {
      max_file_size_mb: 5,
      allowed_file_types: [".pdf", ".doc", ".docx"],
    },
  },
];

export default function QuestionTestPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Question Component Test</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Testing all five Pulse question types.
        </p>
      </div>

      {sampleQuestions.map((question) => (
        <QuestionRenderer key={question.id} question={question} />
      ))}
    </main>
  );
}
