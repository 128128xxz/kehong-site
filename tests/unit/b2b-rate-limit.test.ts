import { beforeEach, describe, expect, it } from "vitest";
import { allowLeadEvent, resetLeadEventRateLimit } from "@/server/b2b-intelligence/rate-limit";

function request(ip: string) {
  return new Request("https://www.kehong.tech/api/lead-event", {
    headers: {
      "x-vercel-id": "unit::iad1",
      "x-forwarded-for": ip,
    },
  });
}

describe("B2B lead-event rate limit", () => {
  beforeEach(() => resetLeadEventRateLimit());

  it("allows 60 events per client window and rejects the 61st", () => {
    for (let index = 0; index < 60; index += 1) {
      expect(allowLeadEvent(request("8.8.8.8"))).toBe(true);
    }
    expect(allowLeadEvent(request("8.8.8.8"))).toBe(false);
    expect(allowLeadEvent(request("1.1.1.1"))).toBe(true);
  });
});
