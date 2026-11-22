"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getForms } from "@/lib/forms-api";
import { EmptyFormsState } from "@/components/forms/empty-forms-state"; // NEW
import { FormsTableSkeleton } from "@/components/shared/loading-state";
import type { Form, FormStatus } from "@/types/form";

const statusStyles: Record<FormStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-green-50 text-green-700",
  closed: "bg-amber-50 text-amber-700",
};


export default function FormsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FormStatus>("all");

  // Stores the forms returned by the API
  const [forms, setForms] = useState<Form[]>([]);

  // Tracks loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch forms when the page loads
  useEffect(() => {
    async function loadForms() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getForms();
        setForms(data);
      } catch {
        setError("Could not load forms. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadForms();
  }, []);

  // Filter forms based on search and selected status
  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch = form.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || form.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [forms, search, statusFilter]);

  // Calculate the number of forms in each status
  const counts = {
    all: forms.length,
    draft: forms.filter((form) => form.status === "draft").length,
    published: forms.filter((form) => form.status === "published").length,
    closed: forms.filter((form) => form.status === "closed").length,
  };

  // NEW: true when the API worked and there are no forms at all
  const hasNoForms = !isLoading && !error && forms.length === 0;

  return (
    <main className="w-full flex-1">
      {/* Page header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 sm:px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Forms</h1>
          <p className="mt-1 text-sm text-slate-500">
            Everything your team is collecting.
          </p>
        </div>

        <Link
          href="/forms/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#050d63] px-5 text-sm font-semibold text-white transition hover:bg-[#0a1580]"
        >
          New form
        </Link>
      </header>

      <div className="mx-auto w-full max-w-7xl p-4 sm:p-8">
        {/* NEW: empty state replaces the filters and table */}
        {hasNoForms ? (
          <EmptyFormsState />
        ) : (
          <>
            {/* Filter pills + search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["all", "All"],
                    ["draft", "Draft"],
                    ["published", "Published"],
                    ["closed", "Closed"],
                  ] as const
                ).map(([status, label]) => {
                  const isActive = statusFilter === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "border-[#050d63] bg-[#050d63] text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                      <span
                        className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {counts[status]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label htmlFor="form-search" className="sr-only">
                  Search forms
                </label>
                <input
                  id="form-search"
                  type="search"
                  placeholder="Search forms by title..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-[#050d63] focus:ring-2 focus:ring-[#050d63]/20 sm:w-64"
                />
              </div>
            </div>

            {/* Table card */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {isLoading ? (
                <FormsTableSkeleton />
              ) : error ? (
                <div className="px-6 py-12 text-center text-sm text-red-600">
                  {error}
                </div>
              ) : filteredForms.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Form</th>
                        <th className="px-4 py-4 font-semibold">Status</th>
                        <th className="px-4 py-4 font-semibold">Created</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          <span className="sr-only">Action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredForms.map((form) => (
                        <tr key={form.form_id} className="hover:bg-slate-50">
                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-900">
                              {form.title}
                            </p>
                            <p className="mt-0.5 text-xs capitalize text-slate-500">
                              {form.type.replace("_", " ")}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[form.status]}`}
                            >
                              {form.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-5 text-slate-500">
                            {form.created_at
                              ? new Date(form.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-5 text-right">
                            {form.status !== "draft" && (
                              <Link
                                href={`/forms/${form.form_id}/results`}
                                className="mr-4 font-medium text-[#050d63] hover:underline"
                              >
                                Results
                              </Link>
                            )}
                            {form.status !== "closed" && (
                              <Link
                                href={`/forms/${form.form_id}`}
                                className="font-medium text-slate-800 hover:underline"
                              >
                                {form.status === "draft" ? "Continue" : "Share"}
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // CHANGED: only reached when forms exist but none match the
                // search or filter, so the "Create a form" button is gone
                <div className="px-6 py-12 text-center">
                  <h2 className="font-semibold text-slate-900">
                    No forms found
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Try changing your search or status filter.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
