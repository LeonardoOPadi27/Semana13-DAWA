import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";

const errorMessages: Record<string, string> = {
  NAME_TOO_SHORT: "El nombre debe tener al menos 2 caracteres.",
  INVALID_EMAIL: "Ingresa un correo valido.",
  PASSWORD_TOO_SHORT: "La clave debe tener al menos 8 caracteres.",
  EMAIL_EXISTS: "Ya existe una cuenta con ese correo.",
  STORAGE_NOT_CONFIGURED:
    "Configura KV_REST_API_URL y KV_REST_API_TOKEN en Vercel para registrar usuarios.",
  REDIS_TIMEOUT:
    "La base de datos tardo demasiado en responder. Intenta nuevamente.",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const user = await createUser({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const message =
      errorMessages[code] ?? "No se pudo crear la cuenta. Intenta de nuevo.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
