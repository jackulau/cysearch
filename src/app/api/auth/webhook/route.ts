import { NextRequest, NextResponse } from "next/server";
import { getSession, updateUserWebhook, getUserWebhook } from "@/lib/auth";
import { sendTestNotification, isValidWebhookUrl } from "@/lib/discord";
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

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl = await getUserWebhook(session.userId);

  return NextResponse.json({
    hasWebhook: !!webhookUrl,
    webhookUrl: webhookUrl ? "••••••" + webhookUrl.slice(-20) : null,
  });
}

export async function POST(request: NextRequest) {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { webhookUrl, test } = await request.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook URL is required" },
        { status: 400 }
      );
    }

    if (!isValidWebhookUrl(webhookUrl)) {
      return NextResponse.json(
        { error: "Invalid Discord webhook URL format" },
        { status: 400 }
      );
    }

    // Test the webhook if requested
    if (test) {
      const success = await sendTestNotification(webhookUrl);
      if (!success) {
        return NextResponse.json(
          { error: "Failed to send test notification. Please check your webhook URL." },
          { status: 400 }
        );
      }
    }

    // Save the webhook URL
    await updateUserWebhook(session.userId, webhookUrl);

    return NextResponse.json({
      success: true,
      message: test ? "Webhook configured and test notification sent!" : "Webhook configured successfully!",
    });
  } catch (error) {
    console.error("Webhook update error:", error);
    return NextResponse.json(
      { error: "Failed to update webhook" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await updateUserWebhook(session.userId, "");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook delete error:", error);
    return NextResponse.json(
      { error: "Failed to remove webhook" },
      { status: 500 }
    );
  }
}
