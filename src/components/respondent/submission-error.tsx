import { CircleAlert } from "lucide-react";

/** Banner at the top of the form when a submit attempt fails. */
export function SubmissionError({
  title,
  messages,
}: {
  title: string;
  messages: string[];
}) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        {messages.map((message) => (
          <p key={message} className="mt-1">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
