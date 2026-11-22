/**
 * Horizontal bars: "how did the answers split". Used for both ratings and
 * multiple choice, so the two read as the same kind of chart.
 */
export function BarList({
  rows,
  total,
}: {
  rows: { label: string; count: number }[];
  total: number; // what percentages are out of
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((row) => {
        const percent = total ? Math.round((row.count / total) * 100) : 0;
        return (
          <li key={row.label}>
            <div className="mb-1.5 flex items-baseline gap-3 text-sm">
              <span className="min-w-0 font-medium text-slate-800">{row.label}</span>
              <span className="ml-auto shrink-0 tabular-nums text-slate-500">
                <b className="font-semibold text-slate-900">{row.count}</b> · {percent}%
              </span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="img"
              aria-label={`${row.label}: ${row.count} (${percent}%)`}
            >
              <div
                className="h-full rounded-full bg-[#050d63]"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
