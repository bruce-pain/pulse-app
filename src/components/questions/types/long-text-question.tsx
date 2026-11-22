import type { QuestionInputProps } from "@/components/questions/question-registry";
import { textInputClass } from "@/components/questions/types/short-text-question";

export function LongTextQuestion({
  question,
  value,
  onChange,
  inputId,
  labelledBy,
  describedBy,
  invalid,
}: QuestionInputProps) {
  const text = typeof value === "string" ? value : "";
  const max = question.config?.max_length;

  return (
    <div>
      <textarea
        id={inputId}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        maxLength={max}
        rows={4}
        placeholder="Type your answer"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-required={question.required || undefined}
        className={`min-h-28 resize-y py-3 ${textInputClass}`}
      />
      {max && (
        <p className="mt-1.5 text-right text-xs tabular-nums text-slate-500">
          {text.length.toLocaleString()} / {max.toLocaleString()}
        </p>
      )}
    </div>
  );
}
