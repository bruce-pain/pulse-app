import type { ComponentType } from "react";
import type { FormQuestion, QuestionType } from "@/types/form";

interface QuestionRendererProps {
  question: FormQuestion;
}

function QuestionLabel({ question }: QuestionRendererProps) {
  return (
    <div className="mb-2">
      <label className="font-medium">
        {question.label}
        {question.required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {question.help_text && (
        <p className="mt-1 text-sm text-muted-foreground">
          {question.help_text}
        </p>
      )}
    </div>
  );
}

function ShortTextQuestion({ question }: QuestionRendererProps) {
  return (
    <div>
      <QuestionLabel question={question} />
      <input
        type="text"
        placeholder="Enter your answer"
        maxLength={question.config?.max_length}
        disabled
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function LongTextQuestion({ question }: QuestionRendererProps) {
  return (
    <div>
      <QuestionLabel question={question} />
      <textarea
        placeholder="Enter your answer"
        maxLength={question.config?.max_length}
        disabled
        rows={4}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function MultipleChoiceQuestion({ question }: QuestionRendererProps) {
  const options = question.config?.options ?? [];

  const allowsMultiple = question.config?.allow_multiple_answers ?? false;

  return (
    <div>
      <QuestionLabel question={question} />

      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center gap-2 text-sm">
            <input
              type={allowsMultiple ? "checkbox" : "radio"}
              name={question.id}
              disabled
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

function RatingQuestion({ question }: QuestionRendererProps) {
  const min = question.config?.min ?? 1;
  const max = question.config?.max ?? 5;

  const ratings = Array.from(
    { length: Math.max(0, max - min + 1) },
    (_, index) => min + index,
  );

  return (
    <div>
      <QuestionLabel question={question} />

      <div className="flex gap-3">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            disabled
            className="h-10 w-10 rounded-md border text-sm"
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
}

function FileUploadQuestion({ question }: QuestionRendererProps) {
  const allowedTypes = question.config?.allowed_file_types ?? [];

  return (
    <div>
      <QuestionLabel question={question} />

      <input
        type="file"
        disabled
        accept={allowedTypes.join(",")}
        className="w-full rounded-md border p-2 text-sm"
      />

      <p className="mt-1 text-xs text-muted-foreground">
        Maximum file size: {question.config?.max_file_size_mb ?? 5} MB
      </p>
    </div>
  );
}

// Maps every question type to its corresponding component.
const questionRegistry: Record<
  QuestionType,
  ComponentType<QuestionRendererProps>
> = {
  short_text: ShortTextQuestion,
  long_text: LongTextQuestion,
  multiple_choice: MultipleChoiceQuestion,
  rating: RatingQuestion,
  file_upload: FileUploadQuestion,
};

// Renders the correct component based on the question type.
export function QuestionRenderer({ question }: QuestionRendererProps) {
  const QuestionComponent = questionRegistry[question.type];

  return (
    <div className="rounded-lg border p-4">
      <QuestionComponent question={question} />
    </div>
  );
}
