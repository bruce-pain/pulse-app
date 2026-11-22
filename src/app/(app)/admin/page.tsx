"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ---------- Mock data (replace with your API later) ---------- */

type Person = {
  id: string;
  name: string;
  email: string;
  access: "Admin" | "Member";
  formsOwned: number;
  status: "Active" | "Inactive";
};

const people: Person[] = [
  {
    id: "1",
    name: "Praise Akinbola",
    email: "praise@company.com",
    access: "Admin",
    formsOwned: 12,
    status: "Active",
  },
  {
    id: "2",
    name: "Tolu Adeyemi",
    email: "tolu@company.com",
    access: "Member",
    formsOwned: 7,
    status: "Active",
  },
  {
    id: "3",
    name: "Segun Bello",
    email: "segun@company.com",
    access: "Member",
    formsOwned: 3,
    status: "Active",
  },
  {
    id: "4",
    name: "Ada Nwosu",
    email: "ada@company.com",
    access: "Member",
    formsOwned: 2,
    status: "Active",
  },
  {
    id: "5",
    name: "Chidi Okeke",
    email: "chidi@company.com",
    access: "Member",
    formsOwned: 1,
    status: "Inactive",
  },
];

const accessStyles: Record<Person["access"], string> = {
  Admin: "bg-[#e4e9fd] text-[#050d63] hover:bg-[#e4e9fd]",
  Member: "bg-slate-100 text-slate-600 hover:bg-slate-100",
};

const statusStyles: Record<Person["status"], string> = {
  Active: "bg-green-50 text-green-700 hover:bg-green-50",
  Inactive: "bg-slate-100 text-slate-600 hover:bg-slate-100",
};

/* ---------- Page ---------- */

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Only admins can see this page. Everyone else goes back to /forms.
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/forms");
    }
  }, [user, isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <main className="w-full flex-1">
      {/* Page header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 sm:px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Users and roles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Who can build forms, and who can administer Pulse.
          </p>
        </div>

        <Button className="h-11 rounded-xl bg-[#050d63] px-5 font-semibold hover:bg-[#0a1580]">
          Invite user
        </Button>
      </header>

      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-8">
        {/* Info note */}
        <p className="border-l-2 border-[#050d63] pl-3 text-xs leading-relaxed text-slate-500">
          Everyone with a company account can answer a form already — answering
          needs no account here. This list is the people who have been given
          access to <span className="font-semibold text-slate-800">build</span>{" "}
          forms or to administer Pulse.
        </p>

        {/* Users table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-slate-50">
                <TableHead className="h-12 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Person
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Access
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Forms owned
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </TableHead>
                <TableHead className="px-6">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {people.map((person) => (
                <TableRow key={person.id} className="hover:bg-slate-50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 shrink-0 rounded-full ${
                          person.status === "Active"
                            ? "bg-[#e4e9fd]"
                            : "bg-slate-100"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {person.name}
                        </p>
                        <p className="text-xs text-slate-500">{person.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`h-6 rounded-full px-3 text-xs font-semibold ${accessStyles[person.access]}`}
                    >
                      {person.access}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-slate-900">
                    {person.formsOwned}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`h-6 rounded-full px-3 text-xs font-semibold ${statusStyles[person.status]}`}
                    >
                      {person.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 text-right">
                    <Button
                      variant="ghost"
                      className="font-medium text-slate-800"
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
