"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "No se pudo crear la cuenta.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setMessage("Cuenta creada. Ahora inicia sesion.");
    } catch {
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#07080d] px-6 py-10 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-153px)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[420px_1fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold">Crear cuenta</h1>
            <p className="mt-2 text-sm text-slate-400">
              Tu clave se guarda cifrada con bcryptjs.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Nombre</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
                placeholder="Ricardo Coello"
                required
              />
            </label>

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
                minLength={8}
                className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
                placeholder="Minimo 8 caracteres"
                required
              />
            </label>

            {message && (
              <p className="rounded-md border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {message}
              </p>
            )}

            <button
              disabled={isLoading}
              className="w-full rounded-md bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creando..." : "Registrarme"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Ya tienes cuenta?{" "}
            <Link className="font-medium text-cyan-300" href="/signin">
              Inicia sesion
            </Link>
          </p>
        </div>

        <div className="max-w-2xl lg:ml-auto">
          <p className="mb-4 text-sm uppercase tracking-[0.32em] text-fuchsia-300">
            Registro local
          </p>
          <h2 className="text-5xl font-semibold leading-tight md:text-6xl">
            Una cuenta local lista para el laboratorio.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
            El flujo conserva la base de NextAuth y suma credenciales sin dejar
            la clave en texto plano.
          </p>
        </div>
      </section>
    </main>
  );
}
