"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddQuestionPanel } from "@/components/builder/add-question-panel";
import { QuestionCard } from "@/components/builder/question-card";
import { SettingsPanel } from "@/components/builder/question-settings";
import { createEmptyForm, createQuestion } from "@/lib/form-defaults";
import { createForm, deleteForm, updateForm } from "@/lib/forms-api";
import type {
  Form,
  FormQuestion,
  FormSettings,
  FormStatus,
  FormType,
  QuestionType,
} from "@/types/form";

type PanelTab = "add" | "preview" | "settings";

const panelCard =
  "scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

function LivePreview({ form }: { form: Form }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h3 className="font-semibold text-slate-900">
          {form.title || "Untitled form"}
        </h3>
        {form.description && (
          <p className="mt-1 text-sm text-slate-600">{form.description}</p>
        )}
      </div>
      {form.questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <p className="text-sm font-medium text-slate-800">
            {question.label || "Untitled question"}
          </p>
          {question.help_text && (
            <p className="text-xs text-slate-500">{question.help_text}</p>
          )}
          {question.type === "multiple_choice" ? (
            <div className="space-y-2">
              {(question.config?.options ?? []).map((option, index) => (
                <p
                  key={`${question.id}-${index}`}
                  className="text-sm text-slate-600"
                >
                  <span className="mr-2 inline-block h-4 w-4 rounded-full border border-slate-300 align-middle" />
                  {option || `Option ${index + 1}`}
                </p>
              ))}
            </div>
          ) : (
            <div className="h-10 rounded-lg border border-slate-200 bg-slate-50" />
          )}
        </div>
      ))}
      {form.questions.length === 0 && (
        <p className="text-sm text-slate-500">
          Add questions to preview your form.
        </p>
      )}
    </div>
  );
}

export function FormBuilder({
  initialForm,
  templateForm,
}: {
  initialForm?: Form; // an existing, already-saved draft
  templateForm?: Form; // a starting point that has not been saved yet
}) {
  const router = useRouter();

  // The whole form lives in one piece of state
  const [form, setForm] = useState<Form>(
    () => initialForm ?? templateForm ?? createEmptyForm(),
  );

  // Has this form been saved to the API yet? (decides create vs update)
  const [isPersisted, setIsPersisted] = useState(Boolean(initialForm));
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("add");

  /* ---------- Editing helpers ---------- */

  // Every edit goes through here so we know there are unsaved changes
  function change(updater: (prev: Form) => Form) {
    setForm(updater);
    setIsDirty(true);
  }

  function updateQuestion(id: string, patch: Partial<FormQuestion>) {
    change((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, ...patch } : q,
      ),
    }));
  }

  function updateConfig(
    id: string,
    patch: NonNullable<FormQuestion["config"]>,
  ) {
    change((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, config: { ...q.config, ...patch } } : q,
      ),
    }));
  }

  function addQuestion(type: QuestionType) {
    change((prev) => ({
      ...prev,
      questions: [...prev.questions, createQuestion(type)],
    }));
  }

  function deleteQuestion(id: string) {
    change((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    change((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.questions.length) return prev;

      const next = [...prev.questions];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, questions: next };
    });
  }

  function updateSettings(patch: Partial<FormSettings>) {
    change((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }

  /* ---------- Validation + saving ---------- */

  function validate(): string | null {
    if (!form.title.trim()) return "Give your form a title.";
    if (form.questions.length === 0) return "Add at least one question.";

    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      const n = i + 1;

      if (!q.label.trim()) return `Question ${n} needs a title.`;

      if (q.type === "multiple_choice") {
        const filled = (q.config?.options ?? []).filter((o) => o.trim());
        if (filled.length < 2) return `Question ${n} needs at least 2 options.`;
      }

      if (q.type === "file_upload" && !q.config?.allowed_file_types?.length) {
        return `Question ${n} needs at least one allowed file type.`;
      }
    }

    return null;
  }

  // Tidy the form before it goes to the API
  function buildPayload(status: FormStatus): Form {
    return {
      ...form,
      status,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      questions: form.questions.map((q) => ({
        ...q,
        label: q.label.trim(),
        help_text: q.help_text?.trim() || undefined,
        config:
          q.type === "multiple_choice"
            ? {
                ...q.config,
                options: (q.config?.options ?? [])
                  .map((o) => o.trim())
                  .filter(Boolean),
              }
            : q.config,
      })),
    };
  }

  async function save(status: FormStatus) {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const payload = buildPayload(status);

      const saved = isPersisted
        ? await updateForm(payload.form_id, payload)
        : await createForm(payload);

      if (!saved) throw new Error("Nothing was saved");

      setForm(saved);
      setIsPersisted(true);
      setIsDirty(false);

      if (status === "published") {
        router.push(`/forms/${saved.form_id}`);
      }
    } catch {
      setError("Could not save the form. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this form? This cannot be undone.")) return;

    try {
      const ok = await deleteForm(form.form_id);
      if (!ok) throw new Error("Not deleted");
      router.replace("/forms");
    } catch {
      setError("Could not delete the form.");
    }
  }

  /* ---------- Right-hand panel tabs ---------- */

  function goTo(tab: PanelTab) {
    setPanelTab(tab);
    document
      .getElementById(`panel-${tab}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const statusText = isSaving
    ? "Saving..."
    : isDirty
      ? "Unsaved changes"
      : isPersisted
        ? "All changes saved"
        : "Not saved yet";

  return (
    <main className="w-full flex-1">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-8 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <input
            value={form.title}
            onChange={(e) =>
              change((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Untitled form"
            aria-label="Form title"
            className="w-full bg-transparent text-2xl font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
            <Badge className="h-6 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Draft
            </Badge>
            <span>{statusText}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => goTo("preview")}
            className="h-11 rounded-xl px-4 font-semibold"
          >
            Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => save("draft")}
            className="h-11 rounded-xl px-4 font-semibold"
          >
            Save draft
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={() => save("published")}
            className="h-11 rounded-xl bg-[#050d63] px-5 font-semibold hover:bg-[#0a1580]"
          >
            Publish
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: questions */}
        <div className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="rounded-xl border-red-200 bg-red-50 px-4 py-3 text-red-700 *:data-[slot=alert-description]:text-red-700"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <textarea
            value={form.description ?? ""}
            onChange={(e) =>
              change((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={2}
            placeholder="Add a description — optional"
            aria-label="Form description"
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#050d63]"
          />

          {form.questions.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
              No questions yet. Pick a type on the right, or use the button
              below.
            </p>
          )}

          {form.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              isFirst={index === 0}
              isLast={index === form.questions.length - 1}
              onChange={(patch: Partial<FormQuestion>) =>
                updateQuestion(question.id, patch)
              }
              onConfigChange={(patch: {
                min?: number;
                max?: number;
                options?: string[];
                max_length?: number;
                max_file_size_mb?: number;
                allowed_file_types?: string[];
                allow_multiple_answers?: boolean;
              }) => updateConfig(question.id, patch)}
              onMove={(direction: 1 | -1) => moveQuestion(index, direction)}
              onDelete={() => deleteQuestion(question.id)}
            />
          ))}

          <button
            type="button"
            onClick={() => addQuestion("short_text")}
            className="w-full rounded-2xl border border-dashed border-[#050d63] bg-[#f3f5ff] py-4 text-sm font-semibold text-[#050d63] transition hover:bg-[#e4e9fd]"
          >
            + Add a question
          </button>
        </div>

        {/* Right: add / preview / settings */}
        <aside className="space-y-4">
          <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1">
            {(
              [
                ["add", "Add"],
                ["preview", "Preview"],
                ["settings", "Settings"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => goTo(tab)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  panelTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <section id="panel-add" className={panelCard}>
            <AddQuestionPanel onAdd={addQuestion} />
          </section>

          <section id="panel-preview" className={panelCard}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Live preview
            </p>
            <p className="mt-3 border-l-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Exactly what a respondent sees.
            </p>
            <div className="mt-4">
              <LivePreview form={form} />
            </div>
          </section>

          <section id="panel-settings" className={panelCard}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Settings
            </p>
            <SettingsPanel
              settings={form.settings}
              formType={form.type}
              canDelete={isPersisted}
              onSettingsChange={updateSettings}
              onTypeChange={(type: FormType) =>
                change((prev) => ({ ...prev, type }))
              }
              onDelete={handleDelete}
            />
          </section>
        </aside>
      </div>
    </main>
  );
}
