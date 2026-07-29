import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth, signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const session = await auth();
  if (session?.user?.id) redirect("/app/chat");
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to reklu.app
          </Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A personal workspace is created automatically. Invite teammates later.
          </p>
          <form action={signUpAction} className="mt-8 space-y-4">
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
            <Button type="submit" className="w-full">Create account</Button>
          </form>
          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden bg-muted/30 p-12 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-sm space-y-4 text-sm text-muted-foreground">
          <p className="text-foreground font-medium">What you get</p>
          <ul className="space-y-1.5">
            <li>· Access to leading AI models</li>
            <li>· Personal workspace with file uploads</li>
            <li>· Optional BYOK for any provider</li>
            <li>· Upgrade for premium models and team features</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
