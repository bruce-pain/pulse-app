import type { ReactNode } from "react";

import { BarList } from "@/components/results/response-chart";
import { formatDateTime, toFileList } from "@/lib/answer-format";
import { typeLabel } from "@/lib/form-defaults";
import type { Form, FormQuestion, FormResponse } from "@/types/form";

/** All answers given to one question, across every response. */
function answersFor(question: FormQuestion, responses: FormResponse[]) {
  return responses.flatMap((r) => {
    const answer = r.answers.find((a) => a.questionId === question.id);
    return answer ? [{ value: answer.value, submittedAt: r.submitted_at }] : [];
  });
}

function average(numbers: number[]) {
  return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : null;
}

/* ---------- Stat cards ---------- */

function StatCards({ form, responses }: { form: Form; responses: FormResponse[] }) {
  const firstRating = form.questions.find((q) => q.type === "rating");
  const ratingAvg = firstRating
    ? average(answersFor(firstRating, responses).map((a) => Number(a.value)))
    : null;

  // Of the questions on the form, how many did the average response answer?
  const completion = form.questions.length
    ? average(responses.map((r) => r.answers.length / form.questions.length))
    : null;

  const stats = [
    { label: "Responses", value: String(responses.length), detail: "in total" },
    {
      label: "Latest",
      value: responses[0] ? formatDateTime(responses[0].submitted_at) : "—",
      detail: "most recent response",
    },
    {
      label: "Avg. rating",
      value: ratingAvg !== null ? ratingAvg.toFixed(1) : "—",
      detail: firstRating ? `out of ${firstRating.config?.max ?? 5}` : "no rating question",
    },
    {
      label: "Completion",
      value: completion !== null ? `${Math.round(completion * 100)}%` : "—",
      detail: "of questions answered",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {s.label}
          </p>
          <p className="mt-1 truncate text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
            {s.value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{s.detail}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- One card per question ---------- */

function QuestionSummary({
  question,
  responses,
}: {
  question: FormQuestion;
  responses: FormResponse[];
}) {
  const answers = answersFor(question, responses);
  let body: ReactNode;

  if (answers.length === 0) {
    body = <p className="text-sm text-slate-500">No answers yet.</p>;
  } else if (question.type === "rating") {
    const min = question.config?.min ?? 1;
    const max = question.config?.max ?? 5;
    const values = answers.map((a) => Number(a.value));
    const rows = [];
    for (let n = max; n >= min; n--) {
      rows.push({ label: String(n), count: values.filter((v) => v === n).length });
    }
    body = (
      <>
        <p className="mb-4 text-sm text-slate-500">
          Average{" "}
          <b className="text-lg font-semibold text-slate-900">
            {average(values)!.toFixed(1)}
          </b>{" "}
          out of {max}
        </p>
        <BarList rows={rows} total={values.length} />
      </>
    );
  } else if (question.type === "multiple_choice") {
    const picks = answers.flatMap((a) => (Array.isArray(a.value) ? (a.value as string[]) : [String(a.value)]));
    const rows = (question.config?.options ?? []).map((option) => ({
      label: option,
      count: picks.filter((p) => p === option).length,
    }));
    body = <BarList rows={rows} total={answers.length} />;
  } else if (question.type === "file_upload") {
    const files = answers.flatMap((a) => toFileList(a.value));
    body = (
      <ul className="space-y-1.5 text-sm text-slate-700">
        {files.slice(0, 5).map((f, i) => (
          <li key={`${f.name}-${i}`} className="truncate">
            {/* Uploaded files have a signed link the owner can open */}
            {f.url ? (
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#050d63] underline underline-offset-2">
                {f.name}
              </a>
            ) : (
              f.name
            )}
          </li>
        ))}
        {files.length > 5 && <li className="text-slate-500">+ {files.length - 5} more</li>}
      </ul>
    );
  } else {
    // Text: the most recent answers, newest first
    body = (
      <ul className="space-y-2.5">
        {answers.slice(0, 3).map((a, i) => (
          <li key={i} className="border-l-2 border-slate-200 pl-3 text-sm text-slate-700">
            <p className="line-clamp-3 break-words">{String(a.value)}</p>
            <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(a.submittedAt)}</p>
          </li>
        ))}
        {answers.length > 3 && (
          <li className="text-xs text-slate-500">
            + {answers.length - 3} more in Individual responses
          </li>
        )}
      </ul>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="rounded-full bg-[#e4e9fd] px-2.5 py-0.5 text-xs font-medium text-[#050d63]">
          {typeLabel(question.type)}
        </span>
        <h3 className="min-w-0 basis-full text-base font-semibold text-slate-900 sm:basis-auto">
          {question.label}
        </h3>
        <span className="text-xs text-slate-500 sm:ml-auto">
          {answers.length} of {responses.length} answered
        </span>
      </div>
      {body}
    </section>
  );
}

export function ResultsSummary({ form, responses }: { form: Form; responses: FormResponse[] }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <StatCards form={form} responses={responses} />
      {form.questions.map((question) => (
        <QuestionSummary key={question.id} question={question} responses={responses} />
      ))}
    </div>
  );
}
