export type Capability = {
  slug: string;
  title: string;
  summary: string;
  buyerValue: string;
  input: string;
};

export type ResourceItem = {
  slug: string;
  title: string;
  type: "guide" | "request";
  summary: string;
  topics: string[];
};

export type ComplianceDocument = {
  title: string;
  documentType: "test-report" | "certificate" | "declaration" | "other";
  status: "available-upon-request" | "public";
};

export const capabilities: Capability[] = [
  { slug: "structural-design", title: "Structural Design", summary: "Review the product footprint, opening, support and packing sequence before quotation.", buyerValue: "A clearer structure brief helps reduce fit and assembly surprises.", input: "Product dimensions, reference images or an existing dieline." },
  { slug: "artwork-prepress", title: "Artwork & Prepress", summary: "Coordinate artwork checks, print areas and version notes against the approved structure.", buyerValue: "Your team sees what needs confirmation before production files move forward.", input: "Artwork, brand colors, logo files and target print method." },
  { slug: "prototyping", title: "Prototyping", summary: "Use structural samples to review size, fit, opening and handling before production.", buyerValue: "Samples turn a packaging idea into a reviewable physical direction.", input: "Target dimensions, product sample or reference structure." },
  { slug: "printing-finishing", title: "Printing & Finishing", summary: "Coordinate print direction and available surface treatments around the material and structure.", buyerValue: "The finish decision stays connected to substrate, artwork and use case.", input: "Print colors, reference finish and application priorities." },
  { slug: "die-cutting-assembly", title: "Die Cutting & Assembly", summary: "Review panels, folds, cut lines, gluing and assembly requirements as one workflow.", buyerValue: "Clear structural handoff supports repeatable converting and packing.", input: "Dieline, structure drawing or a physical reference." },
  { slug: "quality-control", title: "Quality Control", summary: "Use specification, artwork, dimension, finishing and final packing checks through the project.", buyerValue: "Quality checkpoints are tied to the project brief instead of generic claims.", input: "Approved specification, artwork and inspection priorities." },
  { slug: "packing-export-support", title: "Packing & Export Support", summary: "Coordinate packing information and destination requirements for overseas B2B projects.", buyerValue: "The handoff keeps product, packing and destination details aligned.", input: "Destination country, packing preference and shipping brief." },
];

export const processSteps = [
  { number: "01", title: "Inquiry", body: "Share the product, dimensions, quantity and target market." },
  { number: "02", title: "Structure Review", body: "Confirm material direction, format, opening, fit and project constraints." },
  { number: "03", title: "Sample", body: "Review a structural or project sample when the brief requires it." },
  { number: "04", title: "Production", body: "Move the approved specification into printing, converting and assembly." },
  { number: "05", title: "Quality Check", body: "Review agreed checkpoints before packing and shipment." },
  { number: "06", title: "Export Handoff", body: "Align packing, destination and document details for dispatch." },
];

export const resourceItems: ResourceItem[] = [
  { slug: "artwork-guidelines", title: "Artwork Guidelines", type: "guide", summary: "A practical checklist for artwork handoff, color communication and file versions.", topics: ["CMYK and Pantone communication", "Bleed, safe area and cut/fold lines", "Fonts, vectors and image resolution", "Accepted file formats"] },
  { slug: "materials-guide", title: "Materials Guide", type: "guide", summary: "Compare paper, board and corrugated directions by structure, appearance and use.", topics: ["Paper and board selection", "Structure and application", "Surface limitations", "Project-confirmed specifications"] },
  { slug: "finishes-guide", title: "Finishes Guide", type: "guide", summary: "Understand how available finishing directions affect visual effect and artwork planning.", topics: ["Matte or gloss lamination", "Hot foil", "Emboss or deboss", "Spot UV and coating", "Window patching"] },
  { slug: "dielines-templates", title: "Dielines & Templates", type: "request", summary: "No public template is shown without a verified file. Request a dieline for your confirmed structure.", topics: ["Structure type", "Product dimensions", "Cut and fold requirements", "Artwork handoff"] },
  { slug: "packaging-selection-guide", title: "Packaging Selection Guide", type: "guide", summary: "Start from product, transport, display, food-contact and handling priorities.", topics: ["Product fit", "Shipping and protection", "Display and gifting", "Material and finish"] },
  { slug: "proofing-samples", title: "Proofing & Samples", type: "guide", summary: "Understand when a white sample, digital proof or production sample helps the project.", topics: ["White structural sample", "Digital proof", "Printed sample", "Production sample"] },
];

export const complianceDocuments: ComplianceDocument[] = [
  { title: "Project compliance documents", documentType: "other", status: "available-upon-request" },
];

export const finishOptions = ["Matte / gloss lamination", "Hot foil", "Emboss / deboss", "Spot UV", "Window patching", "Aqueous coating", "Specialty paper"];
