import { Lock } from "lucide-react";

export function ClosedFormState({ deadline }: { deadline: string | null }) {
  const closedOn = deadline
    ? new Date(`${deadline}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-14 text-center sm:py-20">
      <span className="flex h-18 w-18 items-center justify-center rounded-3xl bg-amber-50 text-amber-500">
        <Lock className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
        This form has closed.
      </h1>
      <p className="text-base text-slate-500">
        {closedOn
          ? `It stopped accepting responses on ${closedOn}.`
          : "It is no longer accepting responses."}{" "}
        Contact the person who shared it with you if you believe this is an
        error.
      </p>
    </div>
  );
}
