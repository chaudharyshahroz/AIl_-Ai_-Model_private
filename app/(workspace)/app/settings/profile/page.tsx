import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile settings" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/sign-in");

  async function updateProfile(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const name = String(formData.get("name") ?? "").trim().slice(0, 80);
    const preferredModelId = String(formData.get("preferredModelId") ?? "").trim() || null;
    const preferredAuto = formData.get("preferredAuto") === "on";
    await db.user.update({
      where: { id: session.user.id },
      data: { name: name || null, preferredModelId, preferredAuto },
    });
    revalidatePath("/app/settings/profile");
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="display-lg text-2xl">Profile</h1>
          <p className="text-sm text-muted-foreground">Your personal information and preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>How you appear in Reklu.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {user.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                  <AvatarFallback>{(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{user.name ?? "—"}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" name="name" defaultValue={user.name ?? ""} maxLength={80} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-xs text-muted-foreground">Email changes are not yet supported via the UI.</p>
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Default model</CardTitle>
            <CardDescription>Used when you start a new chat without picking one.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredModelId">Preferred model</Label>
                <Input
                  id="preferredModelId"
                  name="preferredModelId"
                  placeholder="e.g. claude-sonnet-4-5, gpt-4o, gemini-2.5-pro"
                  defaultValue={user.preferredModelId ?? ""}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use Reklu Auto. Use the exact model ID from your provider.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preferredAuto"
                  name="preferredAuto"
                  defaultChecked={user.preferredAuto}
                  className="size-4 rounded border-input"
                />
                <Label htmlFor="preferredAuto" className="cursor-pointer">
                  Let Reklu Auto pick the best model
                </Label>
              </div>
              <Button type="submit">Save preferences</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
