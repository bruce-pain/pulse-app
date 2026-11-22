import { Activity } from "lucide-react";

/** Slim top bar on public pages. No navigation: respondents have no account. */
export function PublicFormHeader({ anonymous }: { anonymous?: boolean }) {
  return (
    <header className="flex items-center gap-2.5 border-b border-slate-200 bg-white px-4 py-3.5 sm:px-7">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#050d63] text-white">
        <Activity className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-[15px] font-semibold text-slate-700">Pulse</span>
      {anonymous && (
        <span className="ml-auto rounded-full bg-[#e4e9fd] px-3 py-1 text-xs font-medium text-[#050d63]">
          <span className="hidden sm:inline">Anonymous — nothing identifies you</span>
          <span className="sm:hidden">Anonymous</span>
        </span>
      )}
    </header>
  );
}
