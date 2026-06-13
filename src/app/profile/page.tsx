import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#07080d] px-6 py-10 text-white">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-5">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={88}
                height={88}
                className="rounded-full border border-white/15"
              />
            ) : (
              <div className="grid h-[88px] w-[88px] place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-3xl font-semibold text-cyan-200">
                {session.user?.name?.[0] ?? "U"}
              </div>
            )}
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-fuchsia-300">
                Profile
              </p>
              <h1 className="mt-2 text-2xl font-semibold">
                {session.user?.name ?? "Usuario"}
              </h1>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
          <h2 className="text-xl font-semibold">Datos de sesion</h2>

          <dl className="mt-6 grid gap-4">
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Nombre
              </dt>
              <dd className="mt-2 text-slate-100">
                {session.user?.name ?? "Sin nombre"}
              </dd>
            </div>

            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Email
              </dt>
              <dd className="mt-2 text-slate-100">
                {session.user?.email ?? "Sin email"}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
