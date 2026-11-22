import type { FormQuestion, SubmitAnswer } from "@/types/form";

/**
 * File answers arrive in more than one shape: older/seeded data stores just
 * the file name ("cv.pdf"); uploads store { name, url, size } (one, or a list).
 * This turns any of them into a list we can display.
 */
export function toFileList(value: unknown): { name: string; url?: string }[] {
  if (typeof value === "string") return [{ name: value }];
  if (Array.isArray(value)) return value.flatMap(toFileList);
  if (value && typeof value === "object" && "name" in value) {
    const file = value as { name: string; url?: string };
    return [{ name: String(file.name), url: file.url }];
  }
  return [];
}

/** A stored answer as readable text, e.g. for a table cell. */
export function formatAnswer(
  question: FormQuestion,
  value: SubmitAnswer["value"] | undefined,
): string {
  if (value === undefined || value === null) return "—";

  switch (question.type) {
    case "rating":
      return `${value} / ${question.config?.max ?? 5}`;
    case "multiple_choice":
      return Array.isArray(value) ? (value as string[]).join(", ") : String(value);
    case "file_upload":
      return toFileList(value).map((f) => f.name).join(", ") || "—";
    default:
      return String(value);
  }
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
