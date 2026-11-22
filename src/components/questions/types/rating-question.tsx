import type { QuestionInputProps } from "@/components/questions/question-registry";

export function RatingQuestion({
  question,
  value,
  onChange,
  labelledBy,
  describedBy,
  invalid,
}: QuestionInputProps) {
  const min = question.config?.min ?? 1;
  const max = question.config?.max ?? 5;
  const ratings = Array.from(
    { length: Math.max(0, max - min + 1) },
    (_, index) => min + index,
  );

  return (
    <div>
      <div
        role="group"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className="grid gap-2 sm:gap-2.5"
        style={{ gridTemplateColumns: `repeat(${ratings.length}, minmax(0, 1fr))` }}
      >
        {ratings.map((rating) => {
          const isSelected = value === rating;
          return (
            <button
              key={rating}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${rating} out of ${max}`}
              onClick={() => onChange(rating)}
              className={`h-12 rounded-xl text-base font-semibold tabular-nums transition sm:h-14 sm:text-lg ${
                isSelected
                  ? "bg-[#050d63] text-white"
                  : `bg-slate-100 text-slate-700 hover:bg-[#e4e9fd] ${invalid ? "ring-1 ring-red-300" : ""}`
              }`}
            >
              {rating}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{min} · Lowest</span>
        <span>Highest · {max}</span>
      </div>
    </div>
  );
}
