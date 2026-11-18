import { mockForms } from "@/lib/mock-data";
import type { Form, FormStatus } from "@/types/form";

export async function getForms(): Promise<Form[]> {
  return mockForms;
}

export async function getFormById(id: string): Promise<Form | undefined> {
  return mockForms.find((form) => form.form_id === id);
}

export async function getFormsByStatus(status: FormStatus): Promise<Form[]> {
  return mockForms.filter((form) => form.status === status);
}

export async function searchForms(searchTerm: string): Promise<Form[]> {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return mockForms;
  }

  return mockForms.filter((form) => form.title.toLowerCase().includes(query));
}



export async function createForm(form: Form): Promise<Form> {
  mockForms.push(form);
  return form;
}


export async function updateForm(
  id: string,
  updates: Partial<Form>,
): Promise<Form | undefined> {
  const index = mockForms.findIndex((form) => form.form_id === id);

  if (index === -1) {
    return undefined;
  }

  mockForms[index] = {
    ...mockForms[index],
    ...updates,
  };

  return mockForms[index];
}


export async function deleteForm(id: string): Promise<boolean> {
  const index = mockForms.findIndex((form) => form.form_id === id);

  if (index === -1) {
    return false;
  }

  mockForms.splice(index, 1);
  return true;
}

