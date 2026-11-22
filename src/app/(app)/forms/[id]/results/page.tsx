"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Inbox } from "lucide-react";

import { IndividualResponses } from "@/components/results/individual-responses";
import { ResultsHeader } from "@/components/results/results-header";
import { ResultsSummary } from "@/components/results/results-summary";
import { ResultsSkeleton } from "@/components/shared/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFormById, getFormResponses } from "@/lib/forms-api";
import type { Form, FormResponse } from "@/types/form";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; form: Form; responses: FormResponse[] };

const tabClass =
  "flex-none rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 data-active:bg-[#eef1fd] data-active:text-[#050d63]";

export default function FormResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    // Both requests at once — neither depends on the other
    Promise.all([getFormById(id), getFormResponses(id)])
      .then(([form, responses]) => {
        if (cancelled) return;
        setState(
          form
            ? { kind: "ready", form, responses }
            : { kind: "error", message: "We could not find that form." },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error", message: "Could not load results. Please try again." });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.kind === "loading") {
    return <ResultsSkeleton />;
  }

  if (state.kind === "error") {
    return (
      <main className="w-full flex-1 p-4 sm:p-8">
        <p className="text-sm text-red-600">{state.message}</p>
        <Link href="/forms" className="mt-3 inline-block text-sm font-medium text-[#050d63] hover:underline">
          Back to forms
        </Link>
      </main>
    );
  }

  const { form, responses } = state;

  return (
    <main className="w-full flex-1">
      <ResultsHeader form={form} responseCount={responses.length} />

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-8">
        {responses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4e9fd] text-[#050d63]">
              <Inbox className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-slate-900">No responses yet</h2>
            <p className="max-w-sm text-sm text-slate-500">
              {form.status === "published"
                ? "Share the link and answers will appear here as they come in."
                : form.status === "draft"
                  ? "Publish this form to start collecting responses."
                  : "This form closed without receiving any responses."}
            </p>
            {form.status === "published" && (
              <Link
                href={`/forms/${form.form_id}`}
                className="mt-2 inline-flex h-11 items-center rounded-xl bg-[#050d63] px-5 text-sm font-semibold text-white hover:bg-[#0a1580]"
              >
                Get the share link
              </Link>
            )}
          </div>
        ) : (
          <Tabs defaultValue="summary">
            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 scrollbar-none">
              <TabsTrigger value="summary" className={tabClass}>Summary</TabsTrigger>
              <TabsTrigger value="individual" className={tabClass}>Individual responses</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-5">
              <ResultsSummary form={form} responses={responses} />
            </TabsContent>
            <TabsContent value="individual" className="mt-5">
              <IndividualResponses form={form} responses={responses} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}
