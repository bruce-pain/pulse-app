import Link from "next/link";

export default function AppNavbar() {
  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/forms" className="text-xl font-bold">
          Pulse
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/forms"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Forms
          </Link>

          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>

          <div
            className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold"
            aria-label="User profile"
          >
            A
          </div>
        </div>
      </nav>
    </header>
  );
}
