import Link from "next/link";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  async function signInAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl ?? "/app/chat",
    });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
      <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-10 flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <span className="grid size-8 place-items-center rounded-full bg-foreground text-xs font-black text-background">R</span>
            Back to Reklu
          </Link>
          <div className="rounded-2xl border bg-card/90 p-6 shadow-xl shadow-foreground/5">
            <div className="mb-6">
              <div className="mb-3 flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                Continue your model workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in to pick up your chats, artifacts, provider keys, and workspace usage.
              </p>
            </div>
          {process.env.GOOGLE_CLIENT_ID && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl ?? "/app/chat" });
              }}
              className="mt-6"
            >
              <Button type="submit" variant="outline" className="w-full rounded-full" size="lg">
                <GoogleIcon /> Continue with Google
              </Button>
            </form>
          )}
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form action={signInAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            {error && (
              <p className="text-sm text-destructive">Invalid email or password.</p>
            )}
            <Button type="submit" className="w-full rounded-full">
              Sign in <ArrowRight />
            </Button>
          </form>
          <p className="mt-8 text-sm text-muted-foreground">
            New to Reklu?{" "}
            <Link href="/sign-up" className="text-foreground hover:underline">
              Create an account
            </Link>
          </p>
          </div>
        </div>
      </div>
      <div className="reklu-shell hidden p-8 lg:flex lg:items-center lg:justify-center">
        <Card className="w-full max-w-lg border-border/50 shadow-2xl shadow-foreground/10">
          <CardHeader>
            <CardTitle className="text-2xl">Try the demo workspace</CardTitle>
            <CardDescription>
              Explore Reklu with seeded conversations, models, usage, and admin-ready provider setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="rounded-xl border bg-background/70 p-4">
              <div className="text-muted-foreground">Email</div>
              <code className="mt-1 block rounded bg-muted px-2 py-1">demo@reklu.app</code>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <div className="text-muted-foreground">Password</div>
              <code className="mt-1 block rounded bg-muted px-2 py-1">demopassword</code>
            </div>
            {["Multi-model chat", "Reklu Auto routing", "Usage and cost tracking"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-muted-foreground">
                <Check className="size-4 text-primary" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3.1 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.1-4.8 9.1-9.2 0-.6-.1-1.1-.1-1.6H12z"/>
    </svg>
  );
}
