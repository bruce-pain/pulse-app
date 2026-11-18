"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Form } from "@/types/form";

// "2026-10-20" -> "20 October 2026"
function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const infoCard =
  "flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const infoLabel =
  "text-[11px] font-semibold uppercase tracking-wider text-slate-500";
const infoLink =
  "mt-3 w-fit text-xs font-semibold text-[#050d63] underline underline-offset-2";

export function FormLiveView({ form }: { form: Form }) {
  const [copied, setCopied] = useState(false);

  // This component only renders after the form has loaded in the browser,
  // so window is safe to use here
  const shareLink = `${window.location.origin}/f/${form.form_id}`;
  const displayLink = shareLink.replace(/^https?:\/\//, "");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked by the browser: nothing to do
    }
  }

  const { deadline, anonymous } = form.settings;

  return (
    <main className="w-full flex-1">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {form.title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
            <Badge className="h-6 rounded-full bg-green-50 px-3 text-xs font-semibold text-green-700 hover:bg-green-50">
              Published
            </Badge>
            <span>Accepting responses</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/forms/${form.form_id}/edit`}
            className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Edit form
          </Link>
          <Link
            href="/results"
            className="inline-flex h-11 items-center rounded-xl bg-[#050d63] px-5 text-sm font-semibold text-white transition hover:bg-[#0a1580]"
          >
            View results
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl space-y-6 p-8">
        {/* Hero card */}
        <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </div>

          <h2 className="mt-6 text-2xl font-semibold text-slate-900">
            Your form is live
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Share this link. Only published forms accept responses.
          </p>

          <div className="mt-6 flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
            <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl bg-slate-100 px-4 text-sm text-slate-700 sm:min-w-[320px]">
              <span className="truncate">{displayLink}</span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>

            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-xl bg-[#050d63] px-5 text-sm font-semibold text-white transition hover:bg-[#0a1580]"
            >
              Open the form
            </a>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className={infoCard}>
            <p className={infoLabel}>Who can answer</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              Anyone with the link
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {anonymous
                ? "No account needed — nothing identifies them"
                : "No account needed"}
            </p>
          </div>

          <div className={infoCard}>
            <p className={infoLabel}>Closes on</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {deadline ? formatDate(deadline) : "No deadline"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {deadline
                ? "Responses stop automatically"
                : "Stays open until you close it"}
            </p>
            <button type="button" className={infoLink}>
              See what respondents get after it closes
            </button>
          </div>

          <div className={infoCard}>
            <p className={infoLabel}>Status</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              Published
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Only published forms accept responses
            </p>
            <Link href={`/forms/${form.form_id}/edit`} className={infoLink}>
              Edit what is still editable
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
