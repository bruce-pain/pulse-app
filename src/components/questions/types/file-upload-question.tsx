"use client";

import { useState } from "react";
import { Check, FileText, Loader2, Upload, X } from "lucide-react";

import type { QuestionInputProps } from "@/components/questions/question-registry";
import { ApiError } from "@/lib/api-client";
import {
  formatFileSize,
  normaliseExtension,
  validateFile,
} from "@/lib/response-validation";
import type { FileAnswer } from "@/types/form";

interface RejectedFile {
  name: string;
  size: number;
  reason: string;
}

export function FileUploadQuestion({
  question,
  value,
  onChange,
  inputId,
  labelledBy,
  describedBy,
  invalid,
  uploadFile,
}: QuestionInputProps) {
  // A file the rules turned away. Kept separately from `value` because it
  // was never accepted as the answer, but the respondent must see why.
  const [rejected, setRejected] = useState<RejectedFile | null>(null);
  const [uploading, setUploading] = useState<{ name: string; size: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const files = Array.isArray(value) ? (value as FileAnswer[]) : [];
  const allowed = (question.config?.allowed_file_types ?? []).map(
    normaliseExtension,
  );
  const maxMb = question.config?.max_file_size_mb ?? 5;

  async function accept(file: File | undefined) {
    if (!file || uploading) return;

    // 1. Check type/size here first, so obviously wrong files never upload
    const reason = validateFile(question, file);
    if (reason) {
      setRejected({ name: file.name, size: file.size, reason });
      return;
    }
    setRejected(null);

    // Preview: nothing to upload to, just record the file
    if (!uploadFile) {
      onChange([{ name: file.name, size: file.size, type: file.type }]);
      return;
    }

    // 2. Live: upload now; the answer holds the reference the server returns
    setUploading({ name: file.name, size: file.size });
    try {
      const uploaded = await uploadFile(file);
      onChange([uploaded]); // one file per question
    } catch (err) {
      const reason =
        err instanceof ApiError && err.status === 401
          ? "Sign in to upload files to this form."
          : err instanceof ApiError && err.status !== 0
            ? err.message
            : "The upload did not finish. Check your connection and try again.";
      setRejected({ name: file.name, size: file.size, reason });
    } finally {
      setUploading(null);
    }
  }

  return (
    <div>
      {/* The <label> is the dropzone, so clicking anywhere opens the picker
          and the visually-hidden input still gets keyboard focus. */}
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          accept(e.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-dashed px-4 py-7 text-center transition focus-within:border-[#050d63] focus-within:ring-2 focus-within:ring-[#050d63]/15 hover:border-[#050d63] hover:bg-[#f3f5ff] ${
          isDragging
            ? "border-[#050d63] bg-[#f3f5ff]"
            : invalid
              ? "border-red-300 bg-red-50/40"
              : "border-slate-300 bg-slate-50"
        }`}
      >
        <Upload className="h-5 w-5 text-slate-500" aria-hidden="true" />
        <span className="text-sm font-semibold text-slate-700">
          Drop a file here, or choose one
        </span>
        <span className="text-xs text-slate-500">
          {allowed.length > 0
            ? allowed.map((a) => a.toUpperCase()).join(", ")
            : "Any file type"}{" "}
          · up to {maxMb} MB · one file
        </span>
        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept={allowed.map((a) => `.${a}`).join(",") || undefined}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = ""; // allow choosing the same file again
          }}
        />
      </label>

      {files.map((file) => (
        <div
          key={file.name}
          className="mt-2.5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/50 px-3 py-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-slate-900">
              {file.name}
            </span>
            <span className="block text-xs text-slate-500">
              {formatFileSize(file.size)} · attached
            </span>
          </span>
          <Check className="h-4 w-4 shrink-0 text-green-600" aria-label="Attached" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${file.name}`}
            className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {uploading && (
        <div
          role="status"
          className="mt-2.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-slate-900">
              {uploading.name}
            </span>
            <span className="block text-xs text-slate-500">
              {formatFileSize(uploading.size)} · uploading…
            </span>
          </span>
        </div>
      )}

      {rejected && (
        <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1" role="alert">
            <span className="block truncate text-sm font-medium text-slate-900">
              {rejected.name}
            </span>
            <span className="block text-xs font-medium text-red-700">
              {rejected.reason}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setRejected(null)}
            aria-label={`Dismiss ${rejected.name}`}
            className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
