import { formatAnswer, formatDateTime } from "@/lib/answer-format";
import type { Form, FormResponse } from "@/types/form";

/** One row per response, one column per question. Scrolls sideways on phones. */
export function IndividualResponses({
  form,
  responses,
}: {
  form: Form;
  responses: FormResponse[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-100 px-5 py-3 text-xs text-slate-500">
        {responses.length} {responses.length === 1 ? "response" : "responses"}, newest first
        <span className="sm:hidden"> · scroll sideways to see every question</span>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <caption className="sr-only">Individual responses to {form.title}</caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">#</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">Submitted</th>
              {form.questions.map((q) => (
                <th
                  key={q.id}
                  scope="col"
                  title={q.label}
                  className="max-w-56 min-w-40 truncate px-4 py-3 font-semibold normal-case tracking-normal"
                >
                  {q.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {responses.map((response, index) => (
              <tr key={response.id} className="align-top hover:bg-slate-50">
                <td className="px-5 py-4 font-medium tabular-nums text-slate-900">
                  {responses.length - index}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                  {formatDateTime(response.submitted_at)}
                </td>
                {form.questions.map((q) => {
                  const answer = response.answers.find((a) => a.questionId === q.id);
                  const text = formatAnswer(q, answer?.value);
                  return (
                    <td key={q.id} className="max-w-56 px-4 py-4 text-slate-700">
                      <p className="line-clamp-3 break-words" title={text}>
                        {text}
                      </p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
