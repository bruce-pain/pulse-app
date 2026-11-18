"use client";

import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";

import { FormBuilder } from "@/components/builder/form-builder";
import { createFormFromTemplate, isTemplateId } from "@/lib/form-templates";

export default function NewFormBuilderPage() {
  const { template } = useParams<{ template: string }>();

  // "scratch" = blank form, otherwise one of the three templates
  const isScratch = template === "scratch";
  const isTemplate = isTemplateId(template);

  const templateForm = useMemo(
    () => (isTemplate ? createFormFromTemplate(template) : undefined),
    [isTemplate, template],
  );

  if (!isScratch && !isTemplate) {
    notFound();
  }

  return <FormBuilder templateForm={templateForm} />;
}
