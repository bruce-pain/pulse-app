import Link from "next/link";
import { Activity } from "lucide-react";

export function EmptyFormsState() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-[#e4e9fd] text-[#050d63]">
        <Activity className="h-7 w-7" />
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-slate-900">
        No forms yet
      </h2>
      <p className="mt-3 text-sm text-slate-500">
        Build one from scratch, or start from a template.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/forms/new/scratch"
          className="inline-flex h-11 items-center rounded-xl bg-[#050d63] px-5 text-sm font-semibold text-white transition hover:bg-[#0a1580]"
        >
          Create a form
        </Link>
        <Link
          href="/forms/new"
          className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          Browse templates
        </Link>
      </div>
    </div>
  );
}
