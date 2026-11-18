import {
  getForms as getMockForms,
  getFormById as getMockFormById,
  createForm as createMockForm,
  updateForm as updateMockForm,
  deleteForm as deleteMockForm,
} from "@/lib/mock-api";

import { apiRequest } from "@/lib/api-client";
import type { Form } from "@/types/form";

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export async function getForms(): Promise<Form[]> {
  if (USE_MOCK_API) {
    return getMockForms();
  }

  return apiRequest<Form[]>("/forms");
}

export async function getFormById(id: string): Promise<Form | undefined> {
  if (USE_MOCK_API) {
    return getMockFormById(id);
  }

  return apiRequest<Form>(`/forms/${id}`);
}

export async function createForm(form: Form): Promise<Form> {
  if (USE_MOCK_API) {
    return createMockForm(form);
  }

  return apiRequest<Form>("/forms", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function updateForm(
  id: string,
  updates: Partial<Form>,
): Promise<Form | undefined> {
  if (USE_MOCK_API) {
    return updateMockForm(id, updates);
  }

  return apiRequest<Form>(`/forms/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteForm(id: string): Promise<boolean> {
  if (USE_MOCK_API) {
    return deleteMockForm(id);
  }

  throw new Error(
    "Delete form endpoint has not been confirmed by the backend team.",
  );
}
