"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/components/auth-provider";
import { AppShellSkeleton } from "@/components/shared/loading-state";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <AppShellSkeleton />;
  }

  return (
    // Column on mobile (top bar above content), row on desktop (sidebar beside it)
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      <div className="min-w-0 flex-1 bg-slate-50">{children}</div>
    </div>
  );
}
