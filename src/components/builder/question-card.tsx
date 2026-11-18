"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, MoreHorizontal, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { typeLabel } from "@/lib/form-defaults";
import type { FormQuestion } from "@/types/form";

type Config = NonNullable<FormQuestion["config"]>;

type Props = {
  question: FormQuestion;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<FormQuestion>) => void;
  onConfigChange: (patch: Config) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
};

const FILE_TYPES = ["pdf", "doc", "docx", "png", "jpg"];

const selectClass =
  "h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-[#050d63]";

const previewBox = "rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500";

export function QuestionCard({
  question,
  isFirst,
  isLast,
  onChange,
  onConfigChange,
  onMove,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const config = question.config ?? {};

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Top row: type, required, move/delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="h-6 rounded-full bg-[#e4e9fd] px-3 text-xs font-semibold text-[#050d63] hover:bg-[#e4e9fd]">
            {typeLabel(question.type)}
          </Badge>
          <button
            type="button"
            onClick={() => onChange({ required: !question.required })}
            className={`text-xs font-semibold ${
              question.required ? "text-red-600" : "text-slate-500"
            }`}
          >
            {question.required ? "Required" : "Optional"}
          </button>
        </div>

        <div className="relative flex items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            aria-label="Move question up"
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            disabled={isLast}
            onClick={() => onMove(1)}
            aria-label="Move question down"
          >
            <ArrowDown />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="More actions"
          >
            <MoreHorizontal />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={onDelete}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Question title + help text */}
      <input
        value={question.label}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="Type your question"
        className="mt-4 w-full bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
      />
      <input
        value={question.help_text ?? ""}
        onChange={(e) => onChange({ help_text: e.target.value })}
        placeholder="Add help text — optional"
        className="mt-3 w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
      />

      {/* Type-specific settings */}
      <div className="mt-4">
        {(question.type === "short_text" || question.type === "long_text") && (
          <>
            <div className={previewBox}>Respondent answers here</div>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              Max characters
              <select
                className={selectClass}
                value={config.max_length}
                onChange={(e) =>
                  onConfigChange({ max_length: Number(e.target.value) })
                }
              >
                {(question.type === "short_text"
                  ? [50, 100, 255]
                  : [500, 1000, 2000]
                ).map((n) => (
                  <option key={n} value={n}>
                    {n.toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {question.type === "multiple_choice" && (
          <MultipleChoiceSettings
            config={config}
            onConfigChange={onConfigChange}
          />
        )}

        {question.type === "rating" && (
          <>
            <div className={`${previewBox} flex gap-3`}>
              {Array.from(
                { length: (config.max ?? 5) - (config.min ?? 1) + 1 },
                (_, i) => (config.min ?? 1) + i,
              ).map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              Scale goes up to
              <select
                className={selectClass}
                value={config.max ?? 5}
                onChange={(e) =>
                  onConfigChange({ max: Number(e.target.value) })
                }
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {question.type === "file_upload" && (
          <>
            <div className={previewBox}>
              Drop a file, or choose one — {config.max_file_size_mb ?? 5} MB max
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <label className="flex items-center gap-2">
                Max size
                <select
                  className={selectClass}
                  value={config.max_file_size_mb ?? 5}
                  onChange={(e) =>
                    onConfigChange({ max_file_size_mb: Number(e.target.value) })
                  }
                >
                  {[1, 2, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} MB
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <span>Allowed</span>
                {FILE_TYPES.map((fileType) => {
                  const allowed = config.allowed_file_types ?? [];
                  const isOn = allowed.includes(fileType);

                  return (
                    <button
                      key={fileType}
                      type="button"
                      onClick={() =>
                        onConfigChange({
                          allowed_file_types: isOn
                            ? allowed.filter((t) => t !== fileType)
                            : [...allowed, fileType],
                        })
                      }
                      className={`rounded-full border px-3 py-1 font-semibold uppercase ${
                        isOn
                          ? "border-[#050d63] bg-[#e4e9fd] text-[#050d63]"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      {fileType}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Multiple choice options editor ---------- */

function MultipleChoiceSettings({
  config,
  onConfigChange,
}: {
  config: Config;
  onConfigChange: (patch: Config) => void;
}) {
  const options = config.options ?? [];
  const isMany = config.allow_multiple_answers ?? false;

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-2"
        >
          <span
            className={`h-3.5 w-3.5 shrink-0 border border-slate-400 ${
              isMany ? "rounded-sm" : "rounded-full"
            }`}
          />
          <input
            value={option}
            onChange={(e) =>
              onConfigChange({
                options: options.map((o, i) =>
                  i === index ? e.target.value : o,
                ),
              })
            }
            placeholder={`Option ${index + 1}`}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            disabled={options.length <= 2}
            onClick={() =>
              onConfigChange({ options: options.filter((_, i) => i !== index) })
            }
            aria-label={`Remove option ${index + 1}`}
            className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => onConfigChange({ options: [...options, ""] })}
          className="text-xs font-semibold text-[#050d63] hover:underline"
        >
          + Add option
        </button>

        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={isMany}
            onChange={(e) =>
              onConfigChange({ allow_multiple_answers: e.target.checked })
            }
          />
          Allow more than one answer
        </label>
      </div>
    </div>
  );
}
