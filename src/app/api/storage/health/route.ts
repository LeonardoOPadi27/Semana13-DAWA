import { NextResponse } from "next/server";
import { hasRedisStorage, redisCommand } from "@/lib/kv";

export async function GET() {
  const startedAt = Date.now();

  if (!hasRedisStorage()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "Redis/KV environment variables are missing.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await redisCommand<string>(["PING"]);

    return NextResponse.json({
      ok: result === "PONG",
      configured: true,
      result,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        latencyMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
