import { QUESTION_TYPES } from "@/lib/form-defaults";
import type { QuestionType } from "@/types/form";

export function AddQuestionPanel({
  onAdd,
}: {
  onAdd: (type: QuestionType) => void;
}) {
  return (
    <div>
      <div className="space-y-3">
        {QUESTION_TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => onAdd(t.type)}
            className="flex w-full items-center gap-3 rounded-xl bg-slate-100 px-3 py-3 text-left transition hover:bg-slate-200/70"
          >
            <span className="h-8 w-8 shrink-0 rounded-lg bg-[#e4e9fd]" />
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                {t.label}
              </span>
              <span className="block text-xs text-slate-500">{t.hint}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 border-l-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
        Pick a type to add it to the end of the form. Questions lock once the
        first response arrives.
      </p>
    </div>
  );
}
