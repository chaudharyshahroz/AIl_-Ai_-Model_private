import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { ArrowUpRight } from "lucide-react";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/models", label: "Models" },
  { href: "/pricing", label: "Pricing" },
];

/** Floating pill nav — generous height, elevated, sitting over the hero. */
export function MarketingHeader({ nav = true }: { nav?: boolean }) {
  return (
    <div className="sticky top-4 z-40 px-4">
      <header className="elev-float mx-auto flex h-16 max-w-5xl items-center justify-between rounded-2xl border border-border/60 bg-card/85 pl-5 pr-2.5 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-[17px] font-semibold tracking-tight">Reklu</span>
        </Link>

        {nav && (
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden rounded-lg sm:flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="ink" className="rounded-xl">
            <Link href="/sign-up">
              Start free <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </header>
    </div>
  );
}
