import Link from "next/link";
import { Wordmark } from "@/components/marketing/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Every leading AI model. One connected workspace.
            </p>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">Product</h4>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-foreground">Features</Link>
              </li>
              <li>
                <Link href="/models" className="hover:text-foreground">Models</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">Company</h4>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground">Contact</Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-foreground">Docs</Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">Legal</h4>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/security" className="hover:text-foreground">Security</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Reklu. All rights reserved.</p>
          <p>reklu.app</p>
        </div>
      </div>
    </footer>
  );
}
