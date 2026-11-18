"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { FormBuilder } from "@/components/builder/form-builder";
import { FormLiveView } from "@/components/forms/form-live-view";
import { getFormById } from "@/lib/forms-api";
import type { Form } from "@/types/form";

export default function FormPage() {
  const { formId } = useParams<{ formId: string }>();
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadForm() {
      try {
        const data = await getFormById(formId);

        if (!data) {
          setError("We could not find that form.");
          return;
        }

        // Closed forms go to results (per-form results page comes later)
        if (data.status === "closed") {
          router.replace("/results");
          return;
        }

        setForm(data);
      } catch {
        setError("Could not load the form. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadForm();
  }, [formId, router]);

  if (isLoading) {
    return <p className="p-8 text-sm text-slate-500">Loading form...</p>;
  }

  if (error || !form) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">{error}</p>
        <Link
          href="/forms"
          className="mt-3 inline-block text-sm font-medium text-[#050d63] hover:underline"
        >
          Back to forms
        </Link>
      </div>
    );
  }

  // Drafts are edited in the builder, published forms show the live screen
  return form.status === "draft" ? (
    <FormBuilder initialForm={form} />
  ) : (
    <FormLiveView form={form} />
  );
}
