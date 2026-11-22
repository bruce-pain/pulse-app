"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleCheck } from "lucide-react";

import { QuestionRenderer } from "@/components/questions/question-renderer";
import { SubmissionError } from "@/components/respondent/submission-error";
import { ApiError } from "@/lib/api-client";
import { submitResponse, uploadFileAnswer } from "@/lib/forms-api";
import {
  isEmptyAnswer,
  mapApiAnswerErrors,
  toSubmitAnswers,
  validateAllAnswers,
  validateAnswer,
} from "@/lib/response-validation";
import type { AnswerValue, Form, FormResponse } from "@/types/form";

interface RespondentFormProps {
  form: Form;
  /**
   * "live": the public page — submits to the API.
   * "preview": the builder — same UI and validation, but nothing is sent.
   */
  mode: "live" | "preview";
  onSubmitted?: (response: FormResponse) => void;
}

type Banner = { title: string; messages: string[]; needsSignIn?: boolean } | null;

export function RespondentForm({ form, mode, onSubmitted }: RespondentFormProps) {
  const idPrefix = useId();
  const pathname = usePathname();
  const isPreview = mode === "preview";

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<Banner>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [previewPassed, setPreviewPassed] = useState(false);

  const answeredCount = form.questions.filter(
    (q) => !isEmptyAnswer(answers[q.id] ?? null),
  ).length;
  const progress = form.questions.length
    ? Math.round((answeredCount / form.questions.length) * 100)
    : 0;

  function handleChange(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setPreviewPassed(false);

    // Inline validation: once a question has an error, re-check it on every
    // change so the message disappears the moment it is fixed. We do NOT
    // validate untouched questions while typing — that would nag.
    if (errors[questionId]) {
      const question = form.questions.find((q) => q.id === questionId)!;
      const problem = validateAnswer(question, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (problem) next[questionId] = problem;
        else delete next[questionId];
        return next;
      });
    }
  }

  /** Scroll to and focus the first question with an error. */
  function focusFirstError(errorMap: Record<string, string>) {
    const first = form.questions.find((q) => errorMap[q.id]);
    if (!first) return;
    // Wait one frame so the error message has rendered
    requestAnimationFrame(() => {
      const card = document.getElementById(`${idPrefix}-${first.id}-card`);
      card?.scrollIntoView({ behavior: "smooth", block: "start" });
      card?.focus({ preventScroll: true });
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);

    // 1. Check everything locally first — instant feedback, no request
    const localErrors = validateAllAnswers(form.questions, answers);
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      focusFirstError(localErrors);
      return;
    }

    if (isPreview) {
      setPreviewPassed(true);
      return;
    }

    // 2. Send to the API, which validates again (never trust the client)
    setIsSubmitting(true);
    try {
      const response = await submitResponse(
        form.form_id,
        toSubmitAnswers(form.questions, answers),
      );
      onSubmitted?.(response);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.details.length) {
        // The API rejected specific answers: put each under its question
        const { byQuestion, general } = mapApiAnswerErrors(err.details);
        setErrors(byQuestion);
        focusFirstError(byQuestion);
        if (general.length) {
          setBanner({ title: "Some answers need attention.", messages: general });
        }
      } else if (err instanceof ApiError && err.status === 401) {
        // Non-anonymous forms need to know who is answering
        setBanner({
          title: "Sign in to answer this form.",
          messages: ["This form records who responds, so you need to be signed in. Sign in, then answer it again."],
          needsSignIn: true,
        });
      } else if (err instanceof ApiError && err.status === 409) {
        setBanner({
          title: "You have already answered this form.",
          messages: ["It accepts one response per person."],
        });
      } else if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
        // Closed, past its deadline, or removed while they were answering
        setBanner({
          title: "This form is no longer accepting responses.",
          messages: [err.message],
        });
      } else {
        // Network/server failure: same answers can simply be re-sent
        setHasFailedOnce(true);
        setBanner({
          title: "Your answers were not sent.",
          messages: [
            "The connection dropped on the way. Nothing has been lost — everything you typed is still on this page. Press Try again.",
          ],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2
          className={
            isPreview
              ? "text-lg font-semibold text-slate-900"
              : "text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[32px]"
          }
        >
          {form.title || "Untitled form"}
        </h2>
        {form.description && (
          <p className="mt-1.5 text-slate-500">{form.description}</p>
        )}
        <p className="mt-1.5 text-sm text-slate-500">
          {form.questions.length}{" "}
          {form.questions.length === 1 ? "question" : "questions"}
          {form.settings.anonymous && " · Your answers are not linked to your name."}
        </p>
      </div>

      {/* Progress */}
      <div
        role="progressbar"
        aria-label="Questions answered"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-1.5 overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-[#050d63] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {banner && <SubmissionError title={banner.title} messages={banner.messages} />}
      {banner?.needsSignIn && (
        <Link
          href={`/signin?next=${encodeURIComponent(pathname)}`}
          className="inline-flex h-11 w-fit items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          Sign in and come back
        </Link>
      )}

      {errorCount > 0 && !banner && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {errorCount === 1
            ? "1 question needs attention."
            : `${errorCount} questions need attention.`}
        </p>
      )}

      {form.questions.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
          {isPreview ? "Add questions to preview your form." : "This form has no questions yet."}
        </p>
      )}

      {form.questions.map((question) => (
        <QuestionRenderer
          key={question.id}
          idPrefix={idPrefix}
          question={question}
          value={answers[question.id] ?? null}
          onChange={(value) => handleChange(question.id, value)}
          error={errors[question.id]}
          uploadFile={
            isPreview
              ? undefined
              : (file) => uploadFileAnswer(form.form_id, question.id, file)
          }
        />
      ))}

      {form.questions.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#050d63] px-6 text-sm font-semibold text-white transition hover:bg-[#0a1580] disabled:opacity-60"
          >
            {isSubmitting
              ? "Submitting…"
              : hasFailedOnce
                ? "Try again"
                : isPreview
                  ? "Check answers"
                  : "Submit answers"}
          </button>
          <small className="text-slate-500">
            {isPreview
              ? "Preview only — answers are not sent."
              : "You cannot change your answers after submitting."}
          </small>
        </div>
      )}

      {previewPassed && (
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-green-700">
          <CircleCheck className="h-4 w-4" aria-hidden="true" />
          Everything is valid. A respondent would see the confirmation screen now.
        </p>
      )}
    </form>
  );
}
