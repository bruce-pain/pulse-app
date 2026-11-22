"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, ArrowLeftRight, Menu } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { label: "Forms", href: "/forms" },
  { label: "Results", href: "/results" },
];
const adminItem = { label: "Admin", href: "/admin" };

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#050d63] text-white">
        <Activity className="h-5 w-5" />
      </div>
      <span className="text-xl font-semibold text-slate-900">Pulse</span>
    </div>
  );
}

/**
 * Nav links + user card. Rendered twice: inside the desktop <aside>, and
 * inside the mobile drawer. `onNavigate` lets the drawer close itself when
 * a link is tapped.
 */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Admins get the extra "Admin" link (works for "admin" or "Admin")
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const items = isAdmin ? [...navItems, adminItem] : navItems;

  function handleSignOut() {
    onNavigate?.();
    logout();
    router.replace("/signin");
  }

  return (
    <>
      {/* Nav links */}
      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.href} className="relative">
                {isActive && (
                  <span className="absolute -left-2 top-1/2 h-8 w-0.75 -translate-y-1/2 rounded-full bg-[#050d63]" />
                )}
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#e4e9fd] text-[#050d63]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive ? "bg-[#050d63]" : "bg-slate-500"
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User card */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-[#e4e9fd]" />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold text-slate-900"
              title={user?.email}
            >
              {user?.name || user?.email}
            </p>
            <p className="truncate text-xs capitalize text-slate-500">
              {user?.role}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function AppSidebar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile (< md): top bar + slide-in drawer */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={isDrawerOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition hover:bg-slate-200"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo />
      </header>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="left"
          className="w-72 gap-0 bg-white p-0 md:hidden"
        >
          {/* Dialogs need an accessible name for screen readers */}
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="px-5 py-6">
            <Logo />
          </div>
          <SidebarContent onNavigate={() => setIsDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop (>= md): fixed sidebar */}
      <aside className="sticky top-0 hidden h-screen w-65 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="px-5 py-8">
          <Logo />
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
