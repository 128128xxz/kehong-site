import { describe, expect, it } from "vitest";
import { companyPublicConfig, mailtoHref, publicContact, telHref, whatsappHref } from "@/config/company-public";

describe("public company configuration", () => {
  it("exposes only verified buyer-facing identity and direct channels", () => {
    expect(companyPublicConfig.companyNameZh).toBe("佛山科宏纸品有限公司");
    expect(companyPublicConfig.companyNameEn).toBe("Foshan Kehong Paper Products Co., Ltd.");
    expect(companyPublicConfig.factoryAddressZh).toContain("佛山市南海区布新工业区7号");
    expect(publicContact.email).toBe("info@kehong.tech");
    expect(publicContact.factoryPhone).toBe("+86 15888233221");
    expect(publicContact.internationalPhone).toBe("+44 7599669700");
  });

  it("builds safe direct-contact URLs", () => {
    expect(telHref("+86 15888233221")).toBe("tel:+8615888233221");
    expect(whatsappHref("+44 7599669700")).toBe("https://wa.me/447599669700");
    expect(mailtoHref("info@kehong.tech", "Packaging inquiry")).toBe("mailto:info@kehong.tech?subject=Packaging%20inquiry");
  });
});
