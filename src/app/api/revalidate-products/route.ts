import { NextResponse } from "next/server";
import { revalidateProductPages } from "@/lib/product-cache";
import { productDataRevision } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const expectedSecret = process.env.PRODUCT_REVALIDATE_SECRET ?? process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "Revalidation secret is not configured" }, { status: 503 });
  }

  const providedSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/iu, "")
    ?? request.headers.get("x-revalidate-secret");
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: { slug?: unknown; groupId?: unknown } = {};
  try {
    input = await request.json();
  } catch {
    // Empty body is valid: invalidate the full product catalog.
  }
  const slug = typeof input.slug === "string" && input.slug.trim() ? input.slug.trim() : undefined;
  const groupId = typeof input.groupId === "string" && input.groupId.trim() ? input.groupId.trim() : undefined;
  const result = await revalidateProductPages({ slug, groupId });

  return NextResponse.json({ ok: true, productDataRevision, ...result }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
