"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SearchX } from "lucide-react";

import { ClosedFormState } from "@/components/respondent/closed-form-state";
import { PublicFormHeader } from "@/components/respondent/public-form-header";
import { RespondentForm } from "@/components/respondent/respondent-form";
import { SubmissionConfirmation } from "@/components/respondent/submission-confirmation";
import { PublicFormSkeleton } from "@/components/shared/loading-state";
import { ApiError } from "@/lib/api-client";
import { getFormBySlug } from "@/lib/forms-api";
import type { Form, FormResponse } from "@/types/form";

type PageState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error" }
  | { kind: "closed"; form: Form }
  | { kind: "open"; form: Form }
  | { kind: "submitted"; form: Form; response: FormResponse };

/** Closed by status, or the deadline day has fully passed. */
function isClosed(form: Form): boolean {
  if (form.status === "closed") return true;
  const { deadline } = form.settings;
  return Boolean(deadline && new Date(`${deadline}T23:59:59`) < new Date());
}

export default function RespondentFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<PageState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    getFormBySlug(slug)
      .then((form) => {
        if (cancelled) return;
        setState(isClosed(form) ? { kind: "closed", form } : { kind: "open", form });
      })
      .catch((err) => {
        if (cancelled) return;
        setState(
          err instanceof ApiError && err.status === 404
            ? { kind: "not-found" }
            : { kind: "error" },
        );
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const anonymous = "form" in state ? state.form.settings.anonymous : false;

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <PublicFormHeader anonymous={anonymous} />

      <main className="mx-auto w-full max-w-180 px-4 py-6 sm:px-6 sm:py-10">
        {state.kind === "loading" && <PublicFormSkeleton />}

        {state.kind === "not-found" && (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
            <span className="flex h-18 w-18 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
              <SearchX className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-semibold text-slate-900">
              We could not find this form.
            </h1>
            <p className="text-slate-500">
              Check the link with the person who shared it. It may have been
              mistyped, or the form may have been removed.
            </p>
          </div>
        )}

        {state.kind === "error" && (
          <div className="mx-auto max-w-lg py-16 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              This form did not load.
            </h1>
            <p className="mt-3 text-slate-500">Check your connection and reload the page.</p>
          </div>
        )}

        {state.kind === "closed" && (
          <ClosedFormState deadline={state.form.settings.deadline} />
        )}

        {state.kind === "open" && (
          <RespondentForm
            form={state.form}
            mode="live"
            onSubmitted={(response) => {
              setState({ kind: "submitted", form: state.form, response });
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {state.kind === "submitted" && (
          <SubmissionConfirmation
            formTitle={state.form.title}
            submittedAt={state.response.submitted_at}
            anonymous={state.form.settings.anonymous}
            thankYouMessage={state.form.settings.thank_you_message}
          />
        )}
      </main>
    </div>
  );
}
