import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import {
  clearLoginAttempts,
  getLockStatus,
  recordFailedLogin,
} from "@/lib/login-attempts";
import { normalizeEmail, verifyUserPassword } from "@/lib/users";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Clave", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email ?? "");
        const password = credentials?.password ?? "";

        if (!email || !password) {
          throw new Error("MISSING_CREDENTIALS");
        }

        const lock = await getLockStatus(email);

        if (lock.locked) {
          throw new Error(`LOCKED_${lock.secondsLeft}`);
        }

        const user = await verifyUserPassword(email, password);

        if (!user) {
          const failed = await recordFailedLogin(email);

          if (failed.locked) {
            throw new Error(`LOCKED_${failed.secondsLeft}`);
          }

          throw new Error(`INVALID_${failed.attemptsLeft}`);
        }

        await clearLoginAttempts(email);
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id?: string }).id =
          typeof token.id === "string" ? token.id : token.sub;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
