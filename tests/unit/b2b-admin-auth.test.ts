import { afterEach, describe, expect, it } from "vitest";
import { adminSessionCookie, hasAdminSession, verifyAdminSecret } from "@/server/b2b-intelligence/admin-auth";

const originalSecret = process.env.ADMIN_ACCESS_SECRET;

describe("B2B admin authentication", () => {
  afterEach(() => {
    if (originalSecret === undefined) delete process.env.ADMIN_ACCESS_SECRET;
    else process.env.ADMIN_ACCESS_SECRET = originalSecret;
  });

  it("uses a timing-safe server secret and an expiring HttpOnly cookie", () => {
    process.env.ADMIN_ACCESS_SECRET = "unit-admin-secret";
    expect(verifyAdminSecret("unit-admin-secret")).toBe(true);
    expect(verifyAdminSecret("wrong-secret")).toBe(false);
    const cookie = adminSessionCookie();
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Max-Age=");
    const token = cookie.split(";", 1)[0];
    expect(hasAdminSession(new Request("https://www.kehong.tech/admin/inquiries", { headers: { cookie: token } }))).toBe(true);
  });
});
