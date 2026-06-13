import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#07080d] px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.32em] text-cyan-300">
              Dashboard
            </p>
            <h1 className="text-4xl font-semibold md:text-5xl">
              Hola, {session.user?.name ?? "usuario"}.
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Tu sesion esta protegida por NextAuth y las rutas privadas se
            validan desde el servidor.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["OAuth activo", "Google y GitHub conectados como proveedores."],
            ["Credentials", "Registro local con claves cifradas usando bcryptjs."],
            ["Bloqueo", "Despues de 3 fallos, el login se bloquea 2 minutos."],
          ].map(([title, description]) => (
            <article
              key={title}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20"
            >
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
