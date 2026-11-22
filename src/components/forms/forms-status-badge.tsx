import type { FormStatus } from "@/types/form";

const statusStyles: Record<FormStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-green-50 text-green-700",
  closed: "bg-amber-50 text-amber-700",
};

export function FormStatusBadge({ status }: { status: FormStatus }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full px-3 text-xs font-semibold capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
