import { NextResponse } from "next/server";
import { getInquiryEmailConfig } from "@/lib/emailConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = getInquiryEmailConfig();
  const emailHealthy = email.valid;
  const status = emailHealthy ? "ok" : "degraded";
  return NextResponse.json(
    {
      status,
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID ?? "local",
      timestamp: new Date().toISOString(),
      checks: {
        email: {
          status: emailHealthy ? "ok" : "degraded",
          missing: email.missing,
          invalid: email.invalid,
          fromConfigured: Boolean(email.from),
          recipientCount: email.to.length,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
      status: emailHealthy ? 200 : 503,
    },
  );
}
