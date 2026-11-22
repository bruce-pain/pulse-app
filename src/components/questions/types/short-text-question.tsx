import type { QuestionInputProps } from "@/components/questions/question-registry";

export const textInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#050d63] focus:ring-2 focus:ring-[#050d63]/15 aria-invalid:border-red-400 aria-invalid:bg-red-50/40";

export function ShortTextQuestion({
  question,
  value,
  onChange,
  inputId,
  labelledBy,
  describedBy,
  invalid,
}: QuestionInputProps) {
  return (
    <input
      id={inputId}
      type="text"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      maxLength={question.config?.max_length}
      placeholder="Type your answer"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required={question.required || undefined}
      className={`h-12 ${textInputClass}`}
    />
  );
}
