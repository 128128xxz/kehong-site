export const publicLegalConfig = {
  legalEntityName: "Foshan Kehong Paper Products Co., Ltd.",
  registeredAddress: null,
  registrationNumber: null,
  privacyContactEmail: null,
  effectiveDate: null,
} as const;

export const ownerInputRequired = [
  "registered address and jurisdiction",
  "registration or company identifier, if it should be published",
  "privacy contact email or designated privacy contact",
  "policy effective date",
  "current hosting, email and observability processing details",
] as const;
