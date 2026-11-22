import type { QuestionInputProps } from "@/components/questions/question-registry";

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  inputId,
  labelledBy,
  describedBy,
  invalid,
}: QuestionInputProps) {
  const options = question.config?.options ?? [];
  const allowsMultiple = question.config?.allow_multiple_answers ?? false;

  // Normalise the stored value to a list of picked options
  const picked = Array.isArray(value)
    ? (value as string[])
    : typeof value === "string"
      ? [value]
      : [];

  function toggle(option: string, checked: boolean) {
    if (!allowsMultiple) {
      onChange(option);
      return;
    }
    const next = checked
      ? [...picked, option]
      : picked.filter((p) => p !== option);
    onChange(next);
  }

  return (
    // Real radios/checkboxes inside a labelled group: keyboard arrows,
    // screen readers and the whole-row hit target all come for free.
    <div
      role={allowsMultiple ? "group" : "radiogroup"}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      // aria-invalid is only valid on radiogroup, not group
      aria-invalid={(!allowsMultiple && invalid) || undefined}
      className="flex flex-col gap-2.5"
    >
      {allowsMultiple && (
        <p className="text-xs text-slate-500">Choose all that apply.</p>
      )}
      {options.map((option, index) => (
        <label
          key={index}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition hover:border-[#050d63] hover:bg-[#f3f5ff] has-checked:border-[#050d63] has-checked:bg-[#f3f5ff] ${
            invalid ? "border-red-300" : "border-slate-200"
          }`}
        >
          <input
            type={allowsMultiple ? "checkbox" : "radio"}
            name={inputId}
            value={option}
            checked={picked.includes(option)}
            onChange={(e) => toggle(option, e.target.checked)}
            className="h-4.5 w-4.5 shrink-0 accent-[#050d63]"
          />
          <span className="text-slate-800">
            {option || `Option ${index + 1}`}
          </span>
        </label>
      ))}
    </div>
  );
}
