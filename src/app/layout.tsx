import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import Provider from "@/components/SessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Auth App",
  description: "Laboratorio de autenticacion con NextAuth",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#07080d] text-white">
        <Provider>
          <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#07080d]/85 px-6 py-4 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-cyan-300 font-bold text-slate-950">
                  A
                </span>
                <span className="text-base font-semibold tracking-wide">
                  AuthLab
                </span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Dashboard
                </Link>

                {session?.user ? (
                  <>
                    <Link
                      href="/profile"
                      className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Profile
                    </Link>
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                    >
                      Registro
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>

          {children}
        </Provider>
      </body>
    </html>
  );
}
