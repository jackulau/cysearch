import { NextResponse } from "next/server";
import { getSession, getUserWebhook } from "@/lib/auth";
import { initializeDatabase } from "@/db";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
}

export async function GET() {
  await ensureInitialized();

  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const webhookUrl = await getUserWebhook(session.userId);

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        hasWebhook: !!webhookUrl,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}
