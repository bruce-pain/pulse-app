import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

/*
 * Skeleton layouts for each screen, built from the shadcn <Skeleton>.
 * Each one mirrors the shape of the real page so nothing jumps when the
 * content arrives (no "layout shift").
 *
 * Tone: the theme's bg-muted is almost the same colour as our slate-50 page
 * background, so blocks would be invisible. We pass a slate tone instead of
 * editing the shared shadcn component.
 */
const tone = "bg-slate-200/80";

function Bone({ className }: { className: string }) {
  return <Skeleton className={`${tone} ${className}`} />;
}

/** Screen readers hear one "Loading …" message; the shapes are hidden. */
function LoadingRegion({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

/* ---------- Building blocks ---------- */

export function PageHeaderSkeleton({ actions = 1 }: { actions?: number }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="space-y-2.5">
        <Bone className="h-7 w-56 max-w-full rounded-lg" />
        <Bone className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: actions }, (_, i) => (
          <Bone key={i} className="h-11 flex-1 rounded-xl sm:w-28 sm:flex-none" />
        ))}
      </div>
    </div>
  );
}

/** One question card: label, help line, input area. */
function QuestionCardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <Bone className="h-5 w-3/5" />
      <Bone className="mt-2.5 h-3.5 w-2/5" />
      <Bone className={`mt-5 w-full rounded-xl ${tall ? "h-28" : "h-12"}`} />
    </div>
  );
}

/* ---------- Whole screens ---------- */

/** (app) layout while the saved session is read. */
export function AppShellSkeleton() {
  return (
    <LoadingRegion label="Checking your session…" className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Bone className="h-10 w-10 rounded-lg" />
        <Bone className="h-6 w-24" />
      </div>
      {/* Desktop sidebar */}
      <div className="hidden h-screen w-65 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-3 px-5 py-8">
          <Bone className="h-9 w-9 rounded-lg" />
          <Bone className="h-6 w-20" />
        </div>
        <div className="flex-1 space-y-2 px-4">
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <div className="p-4">
          <Bone className="h-15 w-full rounded-xl" />
        </div>
      </div>
      <div className="min-w-0 flex-1 bg-slate-50">
        <PageHeaderSkeleton />
      </div>
    </LoadingRegion>
  );
}

/** Rows inside the forms table card. */
export function FormsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <LoadingRegion label="Loading forms…">
      <div className="hidden bg-slate-50 px-6 py-4 sm:block">
        <Bone className="h-3 w-40" />
      </div>
      <ul className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center gap-4 px-6 py-5">
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-4 w-3/5 max-w-72" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="h-6 w-20 rounded-full" />
            <Bone className="hidden h-4 w-24 sm:block" />
            <Bone className="hidden h-4 w-16 sm:block" />
          </li>
        ))}
      </ul>
    </LoadingRegion>
  );
}

/** /forms/[id]: works for both the builder and the live (published) view. */
export function FormPageSkeleton() {
  return (
    <LoadingRegion label="Loading form…" className="w-full flex-1">
      <PageHeaderSkeleton actions={3} />
      <div className="mx-auto grid w-full max-w-7xl gap-6 p-4 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Bone className="h-16 w-full rounded-2xl" />
          <QuestionCardSkeleton />
          <QuestionCardSkeleton tall />
          <QuestionCardSkeleton />
        </div>
        <div className="space-y-4">
          <Bone className="h-11 w-full rounded-xl" />
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {[0, 1, 2, 3, 4].map((i) => (
              <Bone key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}

/** /forms/[id]/results: header, 4 stat cards, tabs, question cards. */
export function ResultsSkeleton() {
  return (
    <LoadingRegion label="Loading results…" className="w-full flex-1">
      <PageHeaderSkeleton actions={2} />
      <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-8">
        <div className="flex gap-2">
          <Bone className="h-9 w-24 rounded-lg" />
          <Bone className="h-9 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <Bone className="h-3 w-20" />
              <Bone className="h-8 w-16" />
              <Bone className="h-3 w-28" />
            </div>
          ))}
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Bone className="h-5 w-1/2" />
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="space-y-1.5">
                <Bone className="h-3.5 w-32" />
                <Bone className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

/** /f/[slug]: title, meta line, progress bar, question cards. */
export function PublicFormSkeleton() {
  return (
    <LoadingRegion label="Loading form…" className="flex flex-col gap-4">
      <div className="space-y-2.5">
        <Bone className="h-9 w-2/3 rounded-lg" />
        <Bone className="h-4 w-1/2" />
      </div>
      <Bone className="h-1.5 w-full rounded-full" />
      <QuestionCardSkeleton />
      <QuestionCardSkeleton tall />
      <QuestionCardSkeleton />
    </LoadingRegion>
  );
}
