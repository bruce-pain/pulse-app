import Link from "next/link";
import { BarChart3, FileText, MessageCircle } from "lucide-react";

import {
  TEMPLATES,
  TEMPLATE_NAMES,
  type TemplateId,
} from "@/lib/form-templates";

const appearance = {
  feedback: { icon: MessageCircle, box: "bg-[#e4e9fd] text-[#050d63]" },
  job_application: { icon: FileText, box: "bg-green-100 text-green-600" },
  poll: { icon: BarChart3, box: "bg-amber-100 text-amber-600" },
} satisfies Record<TemplateId, { icon: typeof MessageCircle; box: string }>;

export default function NewFormPage() {
  return (
    <main className="w-full flex-1">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 sm:px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Start from a template
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Three ready-made forms you can edit.
          </p>
        </div>

        <Link
          href="/forms/new/scratch"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-200"
        >
          Start from scratch
        </Link>
      </header>

      {/* Template cards */}
      <div className="mx-auto grid w-full max-w-7xl gap-6 p-4 sm:p-8 md:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => {
          const { icon: Icon, box } = appearance[template.id];
          const questionCount = template.build().questions.length;

          return (
            <div
              key={template.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${box}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                {TEMPLATE_NAMES[template.id]}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
                {template.description}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {questionCount} questions
                </span>
                <Link
                  href={`/forms/new/${template.id}`}
                  className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  Use
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
