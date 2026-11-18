"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, CircleAlert } from "lucide-react"; // added CircleAlert

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const stats = [
  { value: "5", label: "Question types" },
  { value: "3", label: "Form states" },
  { value: "CSV", label: "Export" },
];

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const user = login(email, password);

    if (!user) {
      // copy only, matches the design
      setError(
        "We could not sign you in. Check the email and password and try again.",
      );
      return;
    }

    router.replace("/forms");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <section className="hidden flex-col justify-between bg-gradient-to-br from-[#1e3a9f] via-[#16278a] to-[#050d63] p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#050d63]">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Pulse</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Ask the team. Read the answer.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/70">
            Build a form, share one link, and watch what comes back without a
            spreadsheet anywhere in the middle.
          </p>

          <div className="mt-10 flex gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/50">Pulse — Makkan Innovation</p>
      </section>

      {/* Right: sign-in card */}
      <section className="flex flex-col items-center justify-center bg-slate-50 px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Welcome back.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with your company account to build forms and read what comes
            back.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {error && (
              <Alert
                variant="destructive"
                className="rounded-xl border-red-200 bg-red-50 px-4 py-3 text-red-700 *:data-[slot=alert-description]:text-red-700"
              >
                <CircleAlert className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                aria-invalid={!!error}
                className="h-12 rounded-xl aria-invalid:border-red-300 aria-invalid:bg-red-50/60 aria-invalid:ring-red-200/60"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#050d63] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                aria-invalid={!!error}
                className="h-12 rounded-xl aria-invalid:border-red-300 aria-invalid:bg-red-50/60 aria-invalid:ring-red-200/60"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-[#050d63] text-sm font-semibold hover:bg-[#0a1580]"
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 max-w-sm text-center text-xs text-slate-500">
          {error
            ? "Three more failed attempts will lock this account for 15 minutes. "
            : "Only staff accounts can reach Pulse. Trouble signing in? "}
          <a
            href="mailto:admin@makkan.com"
            className="font-medium text-[#050d63] underline"
          >
            Contact your administrator
          </a>
          {error ? " if you are stuck." : "."}
        </p>
      </section>
    </main>
  );
}
