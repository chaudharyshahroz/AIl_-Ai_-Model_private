import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { ArrowRight } from "lucide-react";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/models", label: "Models" },
  { href: "/pricing", label: "Pricing" },
];

/** Floating pill nav, inset from the viewport edge — replaces the v1 full-width sticky bar. */
export function MarketingHeader({ nav = true }: { nav?: boolean }) {
  return (
    <div className="sticky top-3 z-40 mx-auto w-full max-w-3xl px-4">
      <header className="flex h-12 items-center justify-between rounded-full border bg-card/90 pl-3 pr-1.5 shadow-lg backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-mono text-[13px] font-semibold tracking-tight">Reklu</span>
        </Link>
        {nav && (
          <nav className="hidden gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/sign-up">
              Get started <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </header>
    </div>
  );
}
