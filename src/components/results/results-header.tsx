"use client";

import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";

import { FormStatusBadge } from "@/components/forms/forms-status-badge";
import { exportResponsesCsv } from "@/lib/forms-api";
import type { Form } from "@/types/form";

export function ResultsHeader({ form, responseCount }: { form: Form; responseCount: number }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const deadline = form.settings.deadline
    ? new Date(`${form.settings.deadline}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;

  async function handleExport() {
    setIsExporting(true);
    setExportError(null);
    try {
      // GET /forms/{id}/responses/export.csv
      await exportResponsesCsv(form.form_id, form.title);
    } catch {
      setExportError("Export failed. Try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="min-w-0">
        <Link href="/forms" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          ← All forms
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{form.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <FormStatusBadge status={form.status} />
          <span>
            {responseCount} {responseCount === 1 ? "response" : "responses"}
            {deadline && ` · ${form.status === "closed" ? "closed" : "closes"} ${deadline}`}
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          {responseCount > 0 && (
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              aria-busy={isExporting}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:flex-none"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isExporting ? "Exporting…" : "Export CSV"}
            </button>
          )}
          {form.status === "published" && (
            <Link
              href={`/forms/${form.form_id}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#050d63] px-5 text-sm font-semibold text-white transition hover:bg-[#0a1580] sm:flex-none"
            >
              Share
            </Link>
          )}
        </div>
        {exportError && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {exportError}
          </p>
        )}
      </div>
    </header>
  );
}
