"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

async function withTimeout<T>(promise: Promise<T>, milliseconds = 10000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("CLIENT_TIMEOUT"));
    }, milliseconds);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (error: string) => {
    if (error.startsWith("LOCKED_")) {
      const seconds = error.replace("LOCKED_", "");
      return `Cuenta bloqueada temporalmente. Intenta en ${seconds}s.`;
    }

    if (error.startsWith("INVALID_")) {
      const attempts = error.replace("INVALID_", "");
      return `Correo o clave incorrectos. Intentos restantes: ${attempts}.`;
    }

    if (error === "MISSING_CREDENTIALS") {
      return "Completa tu correo y clave.";
    }

    if (error === "REDIS_TIMEOUT") {
      return "La base de datos tardo demasiado. Intenta otra vez.";
    }

    if (error === "STORAGE_NOT_CONFIGURED") {
      return "Falta configurar Redis/KV en Vercel.";
    }

    if (error === "CLIENT_TIMEOUT") {
      return "El login tardo demasiado. Revisa Redis o intenta otra vez.";
    }

    return "No se pudo iniciar sesion.";
  };

  const handleCredentialsSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const result = await withTimeout(
        signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/dashboard",
        }),
      );

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setMessage(getErrorMessage(result?.error ?? ""));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? getErrorMessage(error.message)
          : "No se pudo conectar con el servidor de autenticacion.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#07080d] px-6 py-10 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-153px)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm uppercase tracking-[0.32em] text-cyan-300">
            NextAuth Lab
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-white md:text-6xl">
            Entra con una experiencia simple, segura y oscura.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
            Usa OAuth o credenciales locales con bloqueo automatico por intentos
            fallidos.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold">Iniciar sesion</h2>
            <p className="mt-2 text-sm text-slate-400">
              Accede al dashboard con tu metodo favorito.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleCredentialsSignIn}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Correo</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
                placeholder="tu@email.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Clave</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
                placeholder="********"
                required
              />
            </label>

            {message && (
              <p className="rounded-md border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {message}
              </p>
            )}

            <button
              disabled={isLoading}
              className="w-full rounded-md bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Validando..." : "Entrar"}
            </button>
          </form>

          <div className="my-6 h-px bg-white/10" />

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium transition hover:border-cyan-300/60 hover:bg-white/[0.07]"
            >
              <FaGoogle />
              Google
            </button>
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium transition hover:border-fuchsia-300/60 hover:bg-white/[0.07]"
            >
              <FaGithub />
              GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            No tienes cuenta?{" "}
            <Link className="font-medium text-cyan-300" href="/register">
              Registrate
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
