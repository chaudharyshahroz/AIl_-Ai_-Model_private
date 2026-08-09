import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { ArrowRight } from "lucide-react";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/models", label: "Models" },
  { href: "/pricing", label: "Pricing" },
];

/** Shared header for every marketing page — was previously copy-pasted per page. */
export function MarketingHeader({ nav = true }: { nav?: boolean }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-[15px] font-semibold tracking-tight">Reklu</span>
        </Link>
        {nav && (
          <nav className="hidden gap-7 md:flex">
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
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">
              Get started <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
