import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * NextAuth v5 configuration.
 * Supports:
 *   - Email + password (credentials)
 *   - Google OAuth (if GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set)
 *
 * Sessions are JWT-based (not database sessions) so the middleware can run in
 * the Edge runtime without touching Prisma.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isAdmin: boolean;
      preferredModelId?: string | null;
      preferredAuto: boolean;
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/sign-in",
    newUser: "/onboarding",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            isAdmin: true,
            isSuspended: true,
            preferredModelId: true,
            preferredAuto: true,
            deletedAt: true,
          },
        });
        if (!user || !user.passwordHash || user.deletedAt || user.isSuspended) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: user.isAdmin,
          preferredModelId: user.preferredModelId,
          preferredAuto: user.preferredAuto,
        } as unknown as { id: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign-in, persist key fields
      if (user) {
        const u = user as unknown as {
          id: string;
          isAdmin?: boolean;
          preferredModelId?: string | null;
          preferredAuto?: boolean;
        };
        token.id = u.id as string;
        token.isAdmin = Boolean(u.isAdmin);
        token.preferredModelId = (u.preferredModelId ?? null) as string | null;
        token.preferredAuto = u.preferredAuto ?? true;
      }
      // Refresh from DB periodically (on every request) to pick up changes
      if (token.id && (trigger === "update" || !token.email)) {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            email: true,
            name: true,
            image: true,
            isAdmin: true,
            preferredModelId: true,
            preferredAuto: true,
            isSuspended: true,
            deletedAt: true,
          },
        });
        if (fresh && !fresh.isSuspended && !fresh.deletedAt) {
          token.email = fresh.email as string;
          token.name = (fresh.name ?? null) as string | null;
          token.picture = (fresh.image ?? null) as string | null;
          token.isAdmin = fresh.isAdmin;
          token.preferredModelId = fresh.preferredModelId;
          token.preferredAuto = fresh.preferredAuto;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.preferredModelId = (token.preferredModelId ?? null) as string | null;
        session.user.preferredAuto = token.preferredAuto !== false;
      }
      return session;
    },
  },
});
