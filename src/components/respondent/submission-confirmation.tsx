import { Check } from "lucide-react";

export function SubmissionConfirmation({
  formTitle,
  submittedAt,
  anonymous,
  thankYouMessage,
}: {
  formTitle: string;
  submittedAt: string;
  anonymous: boolean;
  thankYouMessage?: string;
}) {
  const date = new Date(submittedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      role="status"
      className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-14 text-center sm:py-20"
    >
      <span className="flex h-18 w-18 items-center justify-center rounded-3xl bg-green-100 text-green-600">
        <Check className="h-9 w-9" strokeWidth={2.4} aria-hidden="true" />
      </span>
      <h1 className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
        Response submitted.
      </h1>
      <p className="text-base text-slate-500">
        {/* The owner can set their own message (settings.thankYouMessage) */}
        {thankYouMessage || "Your answers have been recorded and sent to the form owner."}
        {anonymous && " Nothing here identifies you."}
      </p>
      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
        {formTitle} · submitted {date}
      </span>
    </div>
  );
}
