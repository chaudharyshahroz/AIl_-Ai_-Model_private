import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/app/chat");
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to reklu.app
          </Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your conversations.
          </p>
          {process.env.GOOGLE_CLIENT_ID && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl ?? "/app/chat" });
              }}
              className="mt-6"
            >
              <Button type="submit" variant="outline" className="w-full" size="lg">
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
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <p className="mt-8 text-sm text-muted-foreground">
            New to Reklu?{" "}
            <Link href="/sign-up" className="text-foreground hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden bg-muted/30 p-12 lg:flex lg:items-center lg:justify-center">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Try the demo</CardTitle>
            <CardDescription>
              Use the seeded demo account to explore the workspace without signing up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">demo@reklu.app</code>
            </div>
            <div>
              <span className="text-muted-foreground">Password:</span>{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">demopassword</code>
            </div>
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
