import { questionRegistry } from "@/components/questions/question-registry";
import type { AnswerValue, FileAnswer, FormQuestion } from "@/types/form";

interface QuestionRendererProps {
  question: FormQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string;
  /** Unique prefix so ids never clash (e.g. builder preview + page). */
  idPrefix: string;
  uploadFile?: (file: File) => Promise<FileAnswer>;
}

/**
 * One question as the respondent sees it: label, help text, the input for
 * its type (looked up in the registry) and its error. Used by BOTH the public
 * response page and the builder's live preview — that is what keeps the two
 * identical.
 */
export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
  idPrefix,
  uploadFile,
}: QuestionRendererProps) {
  const Input = questionRegistry[question.type];

  const base = `${idPrefix}-${question.id}`;
  const ids = {
    card: `${base}-card`,
    input: `${base}-input`,
    label: `${base}-label`,
    help: `${base}-help`,
    error: `${base}-error`,
  };
  const describedBy =
    [question.help_text && ids.help, error && ids.error]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <section
      id={ids.card}
      // -1: not in the tab order, but focusable so we can move focus here
      // when this question has an error after submitting
      tabIndex={-1}
      className={`scroll-mt-6 rounded-2xl border bg-white p-5 shadow-sm outline-none sm:p-6 ${
        error ? "border-red-200" : "border-slate-200"
      }`}
    >
      <h3
        id={ids.label}
        className="text-base font-semibold text-slate-900 sm:text-[17px]"
      >
        {question.label || "Untitled question"}
        {question.required ? (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 text-xs font-normal text-slate-500">
            Optional
          </span>
        )}
        {question.required && <span className="sr-only"> (required)</span>}
      </h3>

      {question.help_text && (
        <p id={ids.help} className="mt-1 text-sm text-slate-600">
          {question.help_text}
        </p>
      )}

      <div className="mt-4">
        <Input
          question={question}
          value={value}
          onChange={onChange}
          inputId={ids.input}
          labelledBy={ids.label}
          describedBy={describedBy}
          invalid={Boolean(error)}
          uploadFile={uploadFile}
        />
      </div>

      {error && (
        <p
          id={ids.error}
          className="mt-2.5 text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </section>
  );
}
