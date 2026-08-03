import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create your account" };

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 32);
}

async function uniqueSlug(base: string): Promise<string> {
  let s = base || "user";
  let n = 0;
  while (await db.organization.findUnique({ where: { slug: s } })) {
    n += 1;
    s = `${base}-${n}`;
  }
  return s;
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function signUpAction(formData: FormData) {
    "use server";
    const parsed = schema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      redirect("/sign-up?error=invalid");
    }
    const { name, email, password } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) redirect("/sign-up?error=exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { email, name, passwordHash, preferredAuto: true },
    });
    const slug = await uniqueSlug(slugify(email.split("@")[0] ?? "user"));
    const org = await db.organization.create({
      data: {
        name: `${name}'s workspace`,
        slug,
        ownerId: user.id,
        memberships: { create: { userId: user.id, role: "owner" } },
      },
    });

    await signIn("credentials", { email, password, redirectTo: "/app/chat" });
    void org; // keep types happy
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
                Create a connected AI desk
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your personal workspace is created automatically. Invite teammates when you are ready.
              </p>
            </div>
          <form action={signUpAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            {error === "exists" && (
              <p className="text-sm text-destructive">An account with that email already exists.</p>
            )}
            {error === "invalid" && (
              <p className="text-sm text-destructive">Please fill out all fields correctly.</p>
            )}
            <Button type="submit" className="w-full rounded-full">
              Create account <ArrowRight />
            </Button>
          </form>
          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
          </div>
        </div>
      </div>
      <div className="reklu-shell hidden p-8 lg:flex lg:items-center lg:justify-center">
        <div className="w-full max-w-lg rounded-2xl border bg-card/90 p-8 shadow-2xl shadow-foreground/10">
          <div className="model-rail mb-8 h-2 rounded-full" />
          <h2 className="text-3xl font-semibold tracking-tight">What opens on day one</h2>
          <div className="mt-8 grid gap-3">
            {[
              "Chat with configured leading models",
              "Use Reklu Auto for routing decisions",
              "Track latency, tokens, and cost",
              "Prepare workspace providers and skills",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border bg-background/70 p-4 text-sm">
                <Check className="mt-0.5 size-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
