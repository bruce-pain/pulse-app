"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------- Mock data (replace with your API later) ---------- */

const form = {
  title: "Sprint 42 retrospective",
  responses: 128,
  closes: "20 Oct",
};

const stats = [
  { label: "Responses", value: "128", note: "+24 this week" },
  { label: "Completion", value: "86%", note: "of everyone who opened it" },
  { label: "Avg. rating", value: "3.8", note: "out of 5" },
  { label: "Still open", value: "6 days", note: "closes 20 Oct" },
];

// One number per day, 24 Sep to 13 Oct
const daily = [
  15, 30, 22, 45, 72, 55, 35, 27, 62, 95, 112, 85, 45, 30, 22, 40, 68, 50, 37,
  26,
];

const ratingRows = [
  { label: "5", count: 38 },
  { label: "4", count: 46 },
  { label: "3", count: 28 },
  { label: "2", count: 11 },
  { label: "1", count: 5 },
];

const choiceRows = [
  { label: "Tooling", count: 56, percent: 44 },
  { label: "Scope", count: 40, percent: 31 },
  { label: "Reviews", count: 23, percent: 18 },
  { label: "Testing", count: 9, percent: 7 },
];

/* ---------- Small pieces ---------- */

function QuestionTypeBadge({ children }: { children: string }) {
  return (
    <Badge className="h-6 rounded-full bg-[#e4e9fd] px-3 text-xs font-semibold text-[#050d63] hover:bg-[#e4e9fd]">
      {children}
    </Badge>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-[#050d63]"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}

/* ---------- Page ---------- */

export default function ResultsPage() {
  const maxDaily = Math.max(...daily);
  const maxRating = Math.max(...ratingRows.map((r) => r.count));
  const maxChoice = Math.max(...choiceRows.map((r) => r.count));

  return (
    <main className="w-full flex-1">
      {/* Page header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {form.title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
            <Badge className="h-6 rounded-full bg-green-50 px-3 text-xs font-semibold text-green-700 hover:bg-green-50">
              Published
            </Badge>
            <span>
              {form.responses} responses · closes {form.closes}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 rounded-xl px-4 font-semibold"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="h-11 rounded-xl bg-[#050d63] px-5 font-semibold hover:bg-[#0a1580]">
            Share
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl p-8">
        <Tabs defaultValue="summary">
          <TabsList className="h-auto gap-1 bg-transparent p-0">
            {[
              ["summary", "Summary"],
              ["individual", "Individual responses"],
              ["ai", "AI insights"],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 data-active:bg-[#eef1fd] data-active:text-[#050d63] data-[state=active]:bg-[#eef1fd] data-[state=active]:text-[#050d63]"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ---------- Summary tab ---------- */}
          <TabsContent value="summary" className="mt-6 space-y-6">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <Card
                  key={s.label}
                  className="gap-0 rounded-2xl py-0 shadow-sm"
                >
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {s.label}
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-slate-900">
                      {s.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{s.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Responses over time */}
            <Card className="gap-0 rounded-2xl py-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    Responses over time
                  </h2>
                  <p className="text-xs text-slate-500">Daily · since 24 Sep</p>
                </div>

                <div className="mt-6 flex h-32 items-end gap-1.5">
                  {daily.map((value, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-[#eef1fd]"
                      style={{ height: `${(value / maxDaily) * 100}%` }}
                    />
                  ))}
                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-500">
                  <span>24 Sep</span>
                  <span>3 Oct</span>
                  <span>13 Oct</span>
                </div>
              </CardContent>
            </Card>

            {/* Rating question */}
            <Card className="gap-0 rounded-2xl py-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <QuestionTypeBadge>Rating</QuestionTypeBadge>
                  <h2 className="font-semibold text-slate-900">
                    How was the sprint overall?
                  </h2>
                </div>

                <div className="mt-5 space-y-3">
                  {ratingRows.map((row) => (
                    <div key={row.label} className="flex items-center gap-4">
                      <span className="w-3 text-sm text-slate-500">
                        {row.label}
                      </span>
                      <Bar value={row.count} max={maxRating} />
                      <span className="w-8 text-right text-sm text-slate-500">
                        {row.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Multiple choice question */}
            <Card className="gap-0 rounded-2xl py-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <QuestionTypeBadge>Multiple choice</QuestionTypeBadge>
                  <h2 className="font-semibold text-slate-900">
                    Which area needs the most attention?
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  {choiceRows.map((row) => (
                    <div key={row.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-900">{row.label}</span>
                        <span>
                          <span className="font-semibold text-slate-900">
                            {row.count}
                          </span>
                          <span className="text-slate-500">
                            {" "}
                            · {row.percent}%
                          </span>
                        </span>
                      </div>
                      <Bar value={row.count} max={maxChoice} />
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-xs text-slate-500">
                  128 responses · one choice each
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- Other tabs (placeholders) ---------- */}
          <TabsContent value="individual" className="mt-6">
            <Card className="rounded-2xl py-12 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Individual responses will show here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <Card className="rounded-2xl py-12 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                AI insights will show here.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
