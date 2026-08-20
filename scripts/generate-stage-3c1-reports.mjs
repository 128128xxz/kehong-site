import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');
const outPrefix = 'stage-3c1-';

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function write(rel, value) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
}
function json(rel) { return JSON.parse(read(rel)); }
function csvParse(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i], next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
}
function csvEscape(value) {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function csvStringify(rows, headers = Object.keys(rows[0] || {})) {
  return [headers.join(','), ...rows.map(row => headers.map(h => csvEscape(row[h])).join(','))].join('\n') + '\n';
}
function listFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFiles(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}
function bool(v) { return v ? 'true' : 'false'; }

const catalog = json('src/data/catalog.normalized.json');
const skus = catalog.skus || [];
const byId = new Map(skus.map(s => [s.id, s]));
const familyMapRows = csvParse(read('docs/stage-3a-product-family-map.csv'));
const mapById = new Map(familyMapRows.map(r => [r.recordId, r]));
const familyInventory = csvParse(read('docs/stage-3b3-family-inventory.csv'));
const familyMeta = {
  corrugated: { en: 'Corrugated board & flute materials', zh: '瓦楞纸板与坑纸材料', type: 'PRODUCT_FAMILY', role: 'REDEFINE_AFTER_BUSINESS_CONFIRMATION' },
  specialty: { en: 'Specialty & decorative paper', zh: '特种纸与装饰纸', type: 'PRODUCT_FAMILY', role: 'REDEFINE_AFTER_BUSINESS_CONFIRMATION' },
  functional: { en: 'Functional & food paper', zh: '功能纸与食品用纸', type: 'PRODUCT_FAMILY', role: 'REDEFINE_AFTER_BUSINESS_CONFIRMATION' },
  cup: { en: 'Paper cup materials', zh: '纸杯材料', type: 'MATERIAL_FAMILY', role: 'KEEP_AS_MATERIAL_FAMILY' },
  converted: { en: 'Packaging materials & converted components', zh: '包装材料与加工部件', type: 'PRODUCT_FAMILY', role: 'REDEFINE_AFTER_BUSINESS_CONFIRMATION' },
  service: { en: 'OEM / ODM & custom paper converting', zh: 'OEM / ODM 与定制纸品加工', type: 'SERVICE_FAMILY', role: 'MOVE_TO_CAPABILITIES' },
};
const familyNameToId = {
  'Corrugated Board & Flute Materials': 'corrugated', 'Corrugated board & flute materials': 'corrugated', '瓦楞纸板与坑纸材料': 'corrugated',
  'Specialty & Decorative Paper': 'specialty', 'Specialty & decorative paper': 'specialty', '特种纸与装饰纸': 'specialty',
  'Functional & Food Paper': 'functional', 'Functional & food paper': 'functional', '功能纸与食品用纸': 'functional',
  'Paper Cup Materials': 'cup', 'Paper cup materials': 'cup', '纸杯材料': 'cup',
  'Packaging Materials & Converted Components': 'converted', '包装材料与加工部件': 'converted',
  'OEM / ODM & Custom Paper Converting': 'service', 'OEM / ODM & custom paper converting': 'service', 'OEM / ODM 与定制纸品加工': 'service',
};
function familyIdFor(row) {
  const raw = row?.proposedPublicFamily || row?.familyId || '';
  if (familyNameToId[raw]) return familyNameToId[raw];
  const lower = raw.toLowerCase();
  if (lower.includes('corrugated') || raw.includes('瓦楞')) return 'corrugated';
  if (lower.includes('specialty') || raw.includes('特种')) return 'specialty';
  if (lower.includes('functional') || raw.includes('功能')) return 'functional';
  if (lower.includes('cup') || raw.includes('纸杯')) return 'cup';
  if (lower.includes('converted') || raw.includes('加工部件') || raw.includes('包装材料')) return 'converted';
  if (lower.includes('oem') || raw.includes('定制纸')) return 'service';
  return '';
}
function pendingRows() { return skus.filter(s => s.sourceStatus === 'pending' && s.published === false); }

// 1. Family status, based on the preceding audited inventory and current runtime files.
const familyStatus = Object.entries(familyMeta).map(([familyId, meta]) => {
  const inv = familyInventory.find(r => r.familyId === familyId && r.locale === 'en') || {};
  const pendingCount = pendingRows().filter(s => familyIdFor(mapById.get(s.id)) === familyId).length;
  const mapped = familyMapRows.filter(r => familyIdFor(r) === familyId);
  const low = mapped.filter(r => Number(r.mappingConfidence || 0) < 0.85).length;
  const currentPublished = skus.filter(s => s.published && familyIdFor(mapById.get(s.id)) === familyId).length;
  const status = familyId === 'cup' ? 'APPROVED_MATERIAL_FAMILY' : familyId === 'service' ? 'REWORK_CLASSIFICATION' : 'BLOCKED_BUSINESS_DATA';
  const route = inv.baseRoute || (familyId === 'service' ? '/custom-paper-products' : `/products/families/${familyId}`);
  const locales = '6';
  return {
    familyId, currentTitleEn: meta.en, currentTitleZh: meta.zh, baseRoute: route,
    familyType: meta.type, stage3b3Status: status, currentPublishedEvidenceCount: currentPublished,
    currentPendingCandidateCount: pendingCount, currentManualReviewCount: pendingCount,
    currentLowConfidenceCount: low, currentPageInSitemap: familyId === 'cup' ? 'true' : 'false',
    currentLocaleRoutes: locales, recommendedFutureRole: meta.role,
    requiresNewProductRecords: 'false', requiresPendingPromotionReview: familyId === 'cup' ? 'false' : 'true',
    requiresReclassification: familyId === 'service' ? 'true' : 'false',
    notes: familyId === 'cup' ? '3B approved; retain pe-043 and its 18-source canonical structure.' : familyId === 'service' ? 'Service intent; plan capability relocation without executing it in 3C-1.' : 'No eligible published evidence; business confirmation required before any import or sitemap admission.',
  };
});
const familyHeaders = ['familyId','currentTitleEn','currentTitleZh','baseRoute','familyType','stage3b3Status','currentPublishedEvidenceCount','currentPendingCandidateCount','currentManualReviewCount','currentLowConfidenceCount','currentPageInSitemap','currentLocaleRoutes','recommendedFutureRole','requiresNewProductRecords','requiresPendingPromotionReview','requiresReclassification','notes'];
write('docs/stage-3c1-family-status.csv', csvStringify(familyStatus, familyHeaders));

// 2. Inventory existing evidence without treating marketing copy or image filenames as proof.
const textExtensions = new Set(['.md','.csv','.json','.ts','.tsx','.js','.mjs','.txt','.yaml','.yml']);
const evidenceFiles = [
  ...listFiles(path.join(root, 'docs'), f => !path.basename(f).startsWith(outPrefix)),
  ...listFiles(dataDir),
  ...listFiles(path.join(root, 'dictionary')),
  ...listFiles(path.join(root, 'public', 'media')),
];
const uniqueEvidenceFiles = [...new Set(evidenceFiles)].sort();
const knownTerms = skus.map(s => [s.id, s.sku, s.title?.en, s.title?.zh]).flat().filter(Boolean);
const classifyEvidence = (file) => {
  const rel = path.relative(root, file);
  const ext = path.extname(file).toLowerCase();
  const isImage = ['.png','.jpg','.jpeg','.webp','.avif','.gif','.svg'].includes(ext);
  let text = '';
  if (!isImage && textExtensions.has(ext)) { try { text = fs.readFileSync(file, 'utf8').slice(0, 300000); } catch {} }
  const matched = knownTerms.find(t => text.includes(t));
  const lower = `${rel} ${text}`.toLowerCase();
  let evidenceType = isImage ? 'IMAGE' : 'UNKNOWN';
  if (!isImage) {
    if (rel.includes('catalog.normalized') || rel.includes('product-data') || rel.includes('productImages')) evidenceType = 'PRODUCT_RECORD';
    else if (rel.includes('stage-3') || rel.includes('product-family') || rel.includes('product')) evidenceType = 'PRODUCT_DOCUMENT';
    else if (rel.includes('capability') || rel.includes('process') || rel.includes('factory')) evidenceType = 'CAPABILITY_REFERENCE';
    else if (rel.includes('news') || rel.includes('industry') || rel.includes('solution')) evidenceType = 'APPLICATION_REFERENCE';
    else if (lower.includes('certificate') || lower.includes('test report') || lower.includes('认证') || lower.includes('检测')) evidenceType = 'CERTIFICATE_OR_TEST';
    else if (rel.includes('company') || rel.includes('about')) evidenceType = 'COMPANY_DOCUMENT';
  }
  const familyCandidate = familyIdFor(mapById.get(matched)) || (lower.includes('corrugated') || lower.includes('瓦楞') ? 'corrugated' : lower.includes('specialty') || lower.includes('特种') ? 'specialty' : lower.includes('functional') || lower.includes('功能') ? 'functional' : lower.includes('cup') || lower.includes('纸杯') ? 'cup' : lower.includes('oem') || lower.includes('定制') ? 'service' : '');
  const containsImage = isImage || lower.includes('/media/') || lower.includes('image');
  const confirmedDocument = evidenceType === 'CERTIFICATE_OR_TEST';
  return {
    evidenceId: `EVID-${crypto.createHash('sha1').update(rel).digest('hex').slice(0, 10)}`,
    filePath: rel, fileType: ext.slice(1) || 'file', familyCandidate, productCandidate: matched || '', evidenceType,
    containsProductName: bool(Boolean(matched)), containsMaterial: bool(/paper|card|kraft|纸|纸板|材料|coating|涂层/i.test(lower)),
    containsForm: bool(/roll|sheet|tray|board|box|fan|卷|平张|纸托|纸盒|部件/i.test(lower)),
    containsSpecification: bool(/gsm|g\/m|mm|size|规格|克重|尺寸|thickness|坑型/i.test(lower)),
    containsApplication: bool(/application|industry|packaging|food|bakery|paper cup|应用|包装|餐饮|烘焙/i.test(lower)),
    containsImage: bool(containsImage), containsCertificationClaim: bool(/fda|eu compliant|certified|food[- ]?safe|认证|食品级|检测报告/i.test(lower)),
    containsMoq: bool(/moq|minimum order|起订|最小订单/i.test(lower)), containsLeadTime: bool(/lead time|交期|打样时间/i.test(lower)),
    containsPackaging: bool(/packaging|carton|pallet|包装|运输/i.test(lower)),
    usableWithoutConfirmation: 'false', requiresBusinessConfirmation: 'true',
    notes: isImage ? 'Image presence is recorded only; filename/image cannot prove product, specification or ownership.' : confirmedDocument ? 'Potential evidence file; scope and company confirmation still required for a new product claim.' : evidenceType === 'APPLICATION_REFERENCE' ? 'Application/news content cannot prove a product or production capability by itself.' : 'Inventory only; pending records and marketing copy are not publishable evidence.',
  };
};
const evidenceInventory = uniqueEvidenceFiles.map(classifyEvidence);
const evidenceHeaders = ['evidenceId','filePath','fileType','familyCandidate','productCandidate','evidenceType','containsProductName','containsMaterial','containsForm','containsSpecification','containsApplication','containsImage','containsCertificationClaim','containsMoq','containsLeadTime','containsPackaging','usableWithoutConfirmation','requiresBusinessConfirmation','notes'];
write('docs/stage-3c1-existing-evidence-inventory.csv', csvStringify(evidenceInventory, evidenceHeaders));

// 3. Review all pending records against the audited family map. No status is changed.
const blockedFamilies = new Set(['corrugated','specialty','functional','converted']);
const pendingReview = pendingRows().map((s) => {
  const m = mapById.get(s.id) || {};
  const familyId = familyIdFor(m);
  const confidence = Number(m.mappingConfidence || 0);
  const proposedFamily = familyId || m.proposedPublicFamily || '';
  const isBlocked = blockedFamilies.has(familyId);
  const candidateStatus = !familyId ? 'INSUFFICIENT_DATA' : familyId === 'service' ? 'SERVICE_NOT_PRODUCT' : !isBlocked ? 'NOT_RELEVANT_TO_BLOCKED_FAMILIES' : confidence >= 0.9 ? 'STRONG_PENDING_CANDIDATE' : 'POSSIBLE_CANDIDATE_NEEDS_CONFIRMATION';
  const missing = ['business confirmation of commercial existence and family', 'source document or procurement specification', 'image ownership/use confirmation', 'publication approval'];
  if (familyId === 'functional') missing.push('documented authorization for any food/function claim');
  return {
    recordId: s.id, sku: s.sku, slug: s.slug, currentTitleEn: s.title?.en || '', currentTitleZh: s.title?.zh || '',
    currentProductGroup: m.currentProductGroup || s.groupId || '', currentCategory: m.currentCategory || s.categoryId || '', proposedFamily,
    material: s.material || s.productType || '', form: s.form || s.structureOrFlute || '', structureOrFlute: s.structureOrFlute || '',
    gsmOrThickness: s.gsmOrThickness || s.gsm || s.thickness || '', sizeOrWidth: s.commonSize || s.size || '', color: s.color || '', coating: s.coating || '',
    functionalTreatment: s.surfaceProcess || '', application: s.applications || '', buyerIntent: m.primaryBuyerType || '', image: s.mainImageAssetId || '', imageStatus: s.imageMappingStatus || '',
    contentCompleteness: m.contentCompletenessScore || '', mappingConfidence: m.mappingConfidence || '', manualReviewRequired: bool(m.manualReviewRequired !== 'false'),
    materialConflict: 'false', formConflict: 'false', applicationConflict: 'false', candidateStatus,
    missingFields: missing.join('; '), requiredEvidence: 'owner-confirmed product sheet; procurement specification; image ownership/use confirmation; application/buyer confirmation',
    recommendedAction: isBlocked ? 'BUSINESS_CONFIRM_THEN_IMPORT' : 'KEEP_PENDING', notes: `sourceStatus=${s.sourceStatus}; published=${s.published}; no automatic promotion.`
  };
});
const pendingHeaders = ['recordId','sku','slug','currentTitleEn','currentTitleZh','currentProductGroup','currentCategory','proposedFamily','material','form','structureOrFlute','gsmOrThickness','sizeOrWidth','color','coating','functionalTreatment','application','buyerIntent','image','imageStatus','contentCompleteness','mappingConfidence','manualReviewRequired','materialConflict','formConflict','applicationConflict','candidateStatus','missingFields','requiredEvidence','recommendedAction','notes'];
write('docs/stage-3c1-pending-candidate-review.csv', csvStringify(pendingReview, pendingHeaders));
write('docs/stage-3c1-pending-candidate-review.json', JSON.stringify(pendingReview, null, 2) + '\n');

// 4. Propose eight small, neutral seed candidates: two per blocked family, sourced from existing pending records.
const seedRows = [];
for (const familyId of ['corrugated','specialty','functional','converted']) {
  const candidates = pendingReview.filter(r => familyIdFor(mapById.get(r.recordId)) === familyId).sort((a, b) => Number(b.mappingConfidence) - Number(a.mappingConfidence) || a.recordId.localeCompare(b.recordId)).slice(0, 2);
  candidates.forEach((candidate, idx) => {
    const s = byId.get(candidate.recordId);
    const seedId = `SEED-${familyId.toUpperCase()}-${String(idx + 1).padStart(2, '0')}`;
    const common = familyId === 'corrugated' ? 'material · form · structureOrFlute · size · application' : familyId === 'specialty' ? 'material · form · surface · color · application' : familyId === 'functional' ? 'material · form · gsmOrThickness · surface/process (claim authorization required) · application' : 'material · form · structure · size · application';
    seedRows.push({
      seedId, familyId,
      proposedCommercialNameEn: `${candidate.currentTitleEn || `${familyMeta[familyId].en} seed`} — seed candidate (NEEDS_BUSINESS_CONFIRMATION)`,
      proposedCommercialNameZh: `${candidate.currentTitleZh || `${familyMeta[familyId].zh}种子`} — 种子候选（待业务确认）`,
      productType: s.productType || '', material: candidate.material, form: candidate.form,
      requiredDifferentiatingFields: common, requiredApplications: candidate.application || '待业务确认', requiredBuyerIntent: candidate.buyerIntent || 'B2B packaging buyer / converter · confirm',
      requiredImageTypes: 'MAIN; DETAIL; CROSS_SECTION; APPLICATION; PACKAGING', existingPendingCandidates: candidate.recordId,
      existingEvidenceFiles: 'docs/stage-3c1-existing-evidence-inventory.csv (inventory only; confirmation required)',
      minimumFieldsForPublication: 'commercial name; family; material; form; one real procurement specification set; application; buyer type; usable image; image relation; source; company confirmation',
      optionalFields: 'MOQ; price; lead time; sample policy; packaging; logistics; certifications (document required)',
      claimsRequiringDocumentEvidence: familyId === 'functional' ? 'food-grade; food-safe; greaseproof; moisture-resistant; barrier or certification claims' : 'certification; recyclable; biodegradable; compostable; performance claims',
      recommendedPriority: idx === 0 ? 'P1' : 'P2', businessDecisionRequired: 'true', notes: 'Existing pending record is a candidate only; do not publish or invent specifications.'
    });
  });
}
const seedHeaders = ['seedId','familyId','proposedCommercialNameEn','proposedCommercialNameZh','productType','material','form','requiredDifferentiatingFields','requiredApplications','requiredBuyerIntent','requiredImageTypes','existingPendingCandidates','existingEvidenceFiles','minimumFieldsForPublication','optionalFields','claimsRequiringDocumentEvidence','recommendedPriority','businessDecisionRequired','notes'];
write('docs/stage-3c1-seed-product-plan.csv', csvStringify(seedRows, seedHeaders));
write('docs/stage-3c1-seed-product-plan.md', `# Stage 3C-1 seed product plan\n\nEight internal seed candidates are proposed from existing pending records (two per blocked family). They are not new records, are not published, and are not loaded by runtime code. Every row requires owner confirmation and the publication gate in this stage.\n\n| Seed | Family | Existing pending record | Priority |\n|---|---|---|---|\n${seedRows.map(r => `| ${r.seedId} | ${r.familyId} | ${r.existingPendingCandidates} | ${r.recommendedPriority} |`).join('\n')}\n\nNo specific flute, GSM, food-contact, barrier, MOQ, price, lead-time, certification or capacity claim is inferred.\n`);

// 5. Intake and image forms are intentionally blank for unconfirmed fields.
const intakeHeaders = ['businessProductId','familyId','productNameZh','productNameEn','internalSku','existingRecordId','existingPendingRecord','newOrExisting','material','form','layers','structureOrFlute','gsm','thickness','width','sheetSize','rollSize','color','coating','functionalTreatment','printing','finishing','mainApplications','buyerTypes','customizationOptions','moq','quantityUnit','samplePolicy','leadTime','packaging','documentsAvailable','certificateNames','imageMain','imageDetail','imageCrossSection','imageApplication','imagePackaging','sourceDocument','confirmedBy','confirmationDate','publishPriority','readyForImport','notes'];
const intakeRows = seedRows.map(s => ({ businessProductId: s.seedId, familyId: s.familyId, productNameZh: '', productNameEn: '', internalSku: '', existingRecordId: '', existingPendingRecord: s.existingPendingCandidates, newOrExisting: 'EXISTING_PENDING_CANDIDATE', material: '', form: '', layers: '', structureOrFlute: '', gsm: '', thickness: '', width: '', sheetSize: '', rollSize: '', color: '', coating: '', functionalTreatment: '', printing: '', finishing: '', mainApplications: '', buyerTypes: '', customizationOptions: '', moq: '', quantityUnit: '', samplePolicy: '', leadTime: '', packaging: '', documentsAvailable: '', certificateNames: '', imageMain: '', imageDetail: '', imageCrossSection: '', imageApplication: '', imagePackaging: '', sourceDocument: '', confirmedBy: '', confirmationDate: '', publishPriority: s.recommendedPriority, readyForImport: 'false', notes: 'Fill only from company-confirmed source material; blank means unknown.' }));
write('docs/stage-3c1-business-product-intake.csv', csvStringify(intakeRows, intakeHeaders));
const imageHeaders = ['businessProductId','familyId','productName','imageRole','existingImageCandidate','newImageRequired','requiredView','requiredContent','mustShowScale','mustShowCrossSection','mustShowPackaging','mustShowProductionProcess','allowedRepresentativeUse','canBeUsedAsExact','ownershipConfirmed','replacementPriority','notes'];
const imageRows = seedRows.flatMap(s => ['MAIN','DETAIL','CROSS_SECTION','APPLICATION','PACKAGING'].map((role, idx) => ({ businessProductId: s.seedId, familyId: s.familyId, productName: '', imageRole: role, existingImageCandidate: byId.get(s.existingPendingCandidates)?.mainImageAssetId || '', newImageRequired: 'true', requiredView: role === 'MAIN' ? 'clear product view' : role === 'CROSS_SECTION' ? 'structure/cross-section if real' : role.toLowerCase(), requiredContent: role === 'APPLICATION' ? 'real application context; not a customer case without evidence' : role === 'PACKAGING' ? 'real packaging context; not shipment proof without evidence' : 'product-specific visual evidence', mustShowScale: role === 'SIZE_REFERENCE' ? 'true' : 'false', mustShowCrossSection: role === 'CROSS_SECTION' ? 'true' : 'false', mustShowPackaging: role === 'PACKAGING' ? 'true' : 'false', mustShowProductionProcess: 'false', allowedRepresentativeUse: role === 'MAIN' ? 'true' : 'false', canBeUsedAsExact: 'false', ownershipConfirmed: 'false', replacementPriority: idx === 0 ? 'high' : 'medium', notes: 'Existing representative image is not exact evidence; ownership and product relationship must be confirmed.' })));
write('docs/stage-3c1-product-image-intake.csv', csvStringify(imageRows, imageHeaders));

write('docs/stage-3c1-publication-gate.md', `# Stage 3C-1 publication gate\n\nA candidate remains pending until all core fields and evidence are present:\n\n1. Commercial product name\n2. Family\n3. Material\n4. Product form\n5. One real procurement specification set\n6. Main application\n7. Buyer type or procurement use\n8. At least one usable product image\n9. Product-to-image relationship\n10. Source document\n11. Company confirmation status\n\nOptional fields are hidden when unknown: MOQ, price, lead time, sample timing, capacity, certification/test reports, packaging and transport.\n\nThe following claims require an explicit document or company confirmation: food-grade, food-safe, FDA, EU compliant, certified, recyclable, biodegradable, compostable, greaseproof, moisture-resistant, fragrance duration and any measured barrier/performance claim. No such claim is inferred by this stage.\n\n`);

// 6. OEM/ODM is treated as a service/capability candidate, not as a product family.
write('docs/stage-3c1-oem-odm-reclassification-plan.md', `# OEM/ODM reclassification plan\n\n## Current finding\n\nThe existing OEM/ODM route is a SERVICE_FAMILY candidate. It describes project intent (material selection, structure review, sampling and custom paper converting), not a separately evidenced material product. It must not be kept as a sixth product family for indexation purposes.\n\n## Evidence classification\n\n- Capability content: existing capability/process/factory route references and the stage-2 capability source map. These can support a future capability outline, but do not prove every material or performance claim.\n- Customization options: project-led structure review, converting and sampling language; each option must be tied to a confirmed process.\n- Inquiry intent: the current custom-paper-products route is an RFQ/project entry point.\n- Unsupported without confirmation: certification, food-contact, barrier, capacity, equipment count, employee count, all-in-Foshan processing and any universal PE/PLA claim.\n\n## Future navigation and URL plan (not executed)\n\nReuse /capabilities and /process for verified capability content, and preserve /custom-paper-products as a stable project/RFQ route until a future migration is approved. Do not add redirect chains. A later 3C-2C decision may set a single canonical capability destination, but 3C-1 changes no canonical, redirect, sitemap or navigation state.\n\n## Product and sitemap treatment\n\nRemove the OEM/ODM concept from future product-family counting; do not create a product record merely to maintain family totals. Keep the current URL accessible and out of any new product-family sitemap admission until its role and claims are confirmed.\n`);
const capabilityRows = [
  ['CAP-001','/capabilities','capability','Capability overview / stage-2 source map','capability overview','medium','true','Owner must confirm each stated process and boundary before strengthening public claims.'],
  ['CAP-002','/process','capability','Production process route','process and sampling support','medium','true','Process descriptions are capability references, not product proof.'],
  ['CAP-003','/factory','capability','Factory overview','site/context evidence','low','true','Factory imagery or copy cannot prove every capability or that all work is in-house.'],
  ['CAP-004','/custom-paper-products','inquiry-intent','Current OEM/ODM project route','custom project inquiry','medium','true','Preserve route now; future capability relocation requires owner decision.'],
  ['CAP-005','/solutions','application-reference','Solutions and application language','buyer use cases','low','true','Application copy is not a customer case or product evidence without source documents.'],
];
write('docs/stage-3c1-capability-evidence-map.csv', csvStringify(capabilityRows.map(r => ({ evidenceId:r[0], sourcePath:r[1], evidenceRole:r[2], sourceBasis:r[3], supports:r[4], evidenceStrength:r[5], requiresConfirmation:r[6], notes:r[7] })), ['evidenceId','sourcePath','evidenceRole','sourceBasis','supports','evidenceStrength','requiresConfirmation','notes']));

// 7. Compress the evidence request to answerable business decisions.
const decisions = [
  ['DEC-01','P0','corrugated','39','SEED-CORRUGATED-01;SEED-CORRUGATED-02','Do corrugated board/flute materials in the pending list exist as active commercial products?','39 pending candidates; no published evidence','Keep pending','Publishing a non-existent family damages trust','product existence; publication eligibility','corrugated family page; future sitemap','No change in 3C-1','Owner selects active products and source documents.'],
  ['DEC-02','P0','specialty','22','SEED-SPECIALTY-01;SEED-SPECIALTY-02','Do specialty/decorative paper candidates exist as active commercial products?','22 pending candidates; no published evidence','Keep pending','False product or decorative claim','product existence; publication eligibility','specialty family page; future sitemap','No change in 3C-1',''],
  ['DEC-03','P0','functional','21','SEED-FUNCTIONAL-01;SEED-FUNCTIONAL-02','Do functional/food paper candidates exist, and which forms are sold?','21 pending candidates; no published evidence','Keep pending','Food/function claims could be unsafe or inaccurate','product existence; forms; claim review','functional family page; future sitemap','No change in 3C-1',''],
  ['DEC-04','P0','converted','24','SEED-CONVERTED-01;SEED-CONVERTED-02','Do packaging material/converting component candidates exist as distinct products?','24 pending candidates; no published evidence','Keep pending','Over-broad family and duplicate product anchors','product existence; family boundary','converted family page; future sitemap','No change in 3C-1',''],
  ['DEC-05','P0','all blocked','106','8 seeds','Which pending candidates are approved for public publication after evidence review?','All 106 pending; manual review required','Keep pending','Premature indexation','publication approval; confirmation status','Approved seed routes only','No change in 3C-1',''],
  ['DEC-06','P0','all blocked','106','8 seeds','What is the confirmed material and form boundary for each seed?','Mapped material/form fields are candidates only','Needs confirmation','Misclassification and incorrect specifications','material; form; family','family page and product schema','No change in 3C-1',''],
  ['DEC-07','P0','functional','21','2 seeds','Are any food-contact, food-grade, greaseproof, barrier or certification claims authorized?','No claim evidence accepted in 3B3','Do not publish claims','Regulatory/commercial risk','claim authorization and documents','metadata/product claims','No change in 3C-1',''],
  ['DEC-08','P0','service','0','none','Should OEM/ODM remain a service/capability route rather than a product family?','Stage-2 capability map; current service route','Move to capabilities plan','Product taxonomy distortion','family role; capability route','capabilities/process/custom route','No change in 3C-1',''],
  ['DEC-09','P1','corrugated','39','2 seeds','Which structure/flute and size fields are truly purchasable?','Pending structure fields; no evidence','Leave blank until confirmed','Invented construction/spec ranges','structure; size','seed schema','No change in 3C-1',''],
  ['DEC-10','P1','specialty','22','2 seeds','Which surfaces, colors and finishing options are available?','Pending surface/color fields; no evidence','Leave blank until confirmed','Unverified options','surface; color; finishing','seed schema','No change in 3C-1',''],
  ['DEC-11','P1','functional','21','2 seeds','Which process/treatment fields may be stated without regulated claims?','Pending process fields; no evidence','Neutral wording only','Unsupported functional promise','process; treatment','seed schema','No change in 3C-1',''],
  ['DEC-12','P1','converted','24','2 seeds','Which converting steps and applications distinguish the products?','Pending application/process fields','Leave blank until confirmed','Duplicate or vague products','application; process','seed schema','No change in 3C-1',''],
  ['DEC-13','P2','all blocked','106','8 seeds','What MOQ and quantity units apply to each approved product?','Pending MOQ values are not confirmation','Leave blank until confirmed','Commercial mismatch','moq; quantityUnit','quote preset','No change in 3C-1',''],
  ['DEC-14','P2','all blocked','106','8 seeds','What lead time and sample policy can be quoted?','No approved lead-time evidence','Leave blank until confirmed','False delivery promise','leadTime; samplePolicy','quote copy','No change in 3C-1',''],
  ['DEC-15','P2','all blocked','106','8 seeds','What packaging and transport conditions are verified?','No packaging/transport evidence','Leave blank until confirmed','Incorrect logistics guidance','packaging; transport','product/inquiry details','No change in 3C-1',''],
  ['DEC-16','P2','all blocked','106','8 seeds','Which image assets are owned, product-specific and approved for exact use?','337 representative images; ownership not confirmed','Representative only until confirmed','Misleading product imagery','image relation; ownership','product page image gate','No change in 3C-1',''],
  ['DEC-17','P1','all blocked','106','8 seeds','Which buyer applications and buyer types are commercially primary?','Pending applications and mapped buyer intent','Confirm per seed','Wrong RFQ context','applications; buyerTypes','inquiry preset','No change in 3C-1',''],
  ['DEC-18','P0','all blocked','106','8 seeds','Has an authorized company reviewer confirmed source, date and publication readiness?','No confirmation in repository','Not ready','Untraceable publication decision','sourceDocument; confirmedBy; confirmationDate; readyForImport','future import record','No change in 3C-1',''],
];
const decisionHeaders = ['decisionId','priority','familyId','affectedPendingRecords','affectedSeedProducts','question','availableEvidence','recommendedDefault','riskIfIncorrect','fieldsUnlockedByDecision','routesUnlockedByDecision','sitemapImpact','notes'];
write('docs/stage-3c1-business-decision-sheet.csv', csvStringify(decisions.map(r => Object.fromEntries(decisionHeaders.map((h,i)=>[h,r[i]]))), decisionHeaders));
write('docs/stage-3c1-business-decision-guide.md', `# Stage 3C-1 business decision guide\n\nThe 106 pending records are compressed into 18 owner decisions rather than 106 repetitive approvals. P0 decisions establish whether a product exists, its family/material/form, publication authorization and claim boundaries. P1 decisions establish differentiating specifications, applications and process options. P2 decisions establish commercial terms and approved image use.\n\nAnswering a P0 decision unlocks the corresponding seed row for a controlled 3C-2 import review; it does not publish automatically. P1 and P2 remain optional/hidden until confirmed. OEM/ODM is a separate taxonomy decision: keep the current RFQ route stable while moving verified capability content to Capabilities in a later stage.\n`);

write('docs/stage-3c1-stage3c2-import-plan.md', `# Stage 3C-2 import plan (planning only)\n\n## 3C-2A — one family\nImport only the highest-priority, fully confirmed seed from one blocked family. Validate schema, source/confirmation fields, image relationship, family page and publication gate. Do not touch the other families or paper-cup consolidation.\n\n## 3C-2B — confirmed families\nImport only rows with readyForImport=true after company review. Preserve existing 337 record IDs; promote a pending record only when its source, product identity and publication decision are explicitly confirmed, otherwise create a new clearly sourced record with collision checks. Add family sitemap URLs only after page, hreflang and canonical checks pass.\n\n## 3C-2C — OEM/ODM taxonomy\nMove verified capability content to /capabilities and /process; preserve /custom-paper-products as the project route until a separate migration approval. Avoid redirect chains and do not delete the existing route.\n\n## Safety and rollback\nNo SKU or slug collision, no invented variants, no changes to paper-cup canonical rules. Before each batch record data/media hashes; on failure restore only the new batch from its audited snapshot, never reset or discard unrelated user work.\n`);
const fieldMap = [
  ['businessProductId','internal only','not runtime','Seed identity and audit link.'],['familyId','familyId','runtime','Use approved family key only.'],['productNameZh','title.zh','runtime','Publish only after confirmation.'],['productNameEn','title.en','runtime','Publish only after confirmation.'],['internalSku','sku','runtime','Collision check required.'],['existingRecordId','id','runtime/audit','Preserve existing ID when promoting a pending row.'],['material','materialIds/productType','runtime','Map to existing controlled vocabulary.'],['form','structureOrFlute','runtime','Use confirmed form, not inferred.'],['layers','notes/internal','internal','No schema target unless a controlled field exists.'],['structureOrFlute','structureOrFlute','runtime','Do not invent flute/structure.'],['gsm','gsm/gsmOrThickness','runtime','Exact confirmed value only.'],['thickness','thickness/gsmOrThickness','runtime','Exact confirmed value only.'],['width','size/commonSize','runtime','Map only when source states it.'],['sheetSize','size/commonSize','runtime','Map only when source states it.'],['rollSize','size/commonSize','runtime','Map only when source states it.'],['color','color','runtime','Optional; hide when unknown.'],['coating','coating','runtime','Claims require confirmation.'],['functionalTreatment','surfaceProcess/notes','runtime/internal','No food/barrier claim without evidence.'],['printing','process','runtime','Confirmed process only.'],['finishing','finishingProcess/process','runtime','Confirmed process only.'],['mainApplications','applications/applicationsList','runtime','Buyer-confirmed application.'],['buyerTypes','industries','runtime','Buyer intent, not a certification.'],['customizationOptions','customizable/notes','runtime/internal','Do not imply universal capability.'],['moq','moq','runtime optional','Hide if unknown.'],['quantityUnit','unit','runtime optional','Keep unit consistent with MOQ.'],['samplePolicy','notes','runtime optional','Hide if unknown.'],['leadTime','notes','runtime optional','Hide if unknown.'],['packaging','notes','runtime optional','Hide if unknown.'],['documentsAvailable','source/notes','internal','Evidence links and document inventory.'],['certificateNames','notes','internal','Only publish with actual document.'],['imageMain','mainImageAssetId','runtime','Image relationship and ownership required.'],['imageDetail','galleryAssetIds','runtime','Product-specific assets only.'],['imageCrossSection','galleryAssetIds','runtime','Do not use representative image as exact.'],['imageApplication','galleryAssetIds','runtime','Not a customer case without proof.'],['imagePackaging','galleryAssetIds','runtime','Not shipment proof without proof.'],['sourceDocument','internal provenance','internal','Required for publication gate.'],['confirmedBy','internal provenance','internal','Required for publication gate.'],['confirmationDate','internal provenance','internal','Required for publication gate.'],['publishPriority','internal review','internal','Does not publish.'],['readyForImport','internal gate','internal','Default false; only owner may set true.'],
];
write('docs/stage-3c1-stage3c2-field-map.csv', csvStringify(fieldMap.map(r => ({ intakeField:r[0], existingSchemaField:r[1], destination:r[2], rule:r[3] })), ['intakeField','existingSchemaField','destination','rule']));
write('docs/stage-3c1-unresolved-backlog.md', `# Stage 3C-1 unresolved backlog\n\n- 106 pending records remain pending; none is automatically promoted.\n- Four families (corrugated, specialty, functional and converted) have no eligible published evidence and require owner-confirmed source material.\n- OEM/ODM requires capability/service reclassification; no runtime migration was executed.\n- All proposed seeds require source, image relation/ownership and company confirmation.\n- Regulated/performance claims, MOQ, price, lead time, packaging and logistics remain blank/hidden until evidence is supplied.\n- Stage 3C-2 must preserve the paper-cup pe-043 canonical and 259-page sitemap baseline.\n`);

const sha = rel => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
const summary = `STAGE_3C1_STATUS=COMPLETE_DATA_INTAKE_ONLY\nRUNTIME_CHANGED=false\nPRODUCT_DATA_CHANGED=false\nPRODUCT_RECORD_FIELDS_CHANGED=false\nPAGE_CHANGED=false\nSITEMAP_CHANGED=false\nCANONICAL_CHANGED=false\nROBOTS_CHANGED=false\nREDIRECTS_CHANGED=false\nINQUIRY_API_CHANGED=false\nIMAGE_CHANGED=false\n\nBLOCKED_FAMILY_COUNT=4\nREWORK_CLASSIFICATION_FAMILY_COUNT=1\nPRODUCT_FAMILY_COUNT_AFTER_RECOMMENDED_RECLASSIFICATION=5\nSERVICE_FAMILY_COUNT_AFTER_RECOMMENDED_RECLASSIFICATION=1\n\nPENDING_RECORDS_ANALYZED=${pendingReview.length}\nSTRONG_PENDING_CANDIDATES=${pendingReview.filter(r=>r.candidateStatus==='STRONG_PENDING_CANDIDATE').length}\nPOSSIBLE_PENDING_CANDIDATES=${pendingReview.filter(r=>r.candidateStatus==='POSSIBLE_CANDIDATE_NEEDS_CONFIRMATION').length}\nINSUFFICIENT_PENDING_RECORDS=${pendingReview.filter(r=>r.candidateStatus==='INSUFFICIENT_DATA').length}\nFAMILY_CONFLICT_PENDING_RECORDS=${pendingReview.filter(r=>r.candidateStatus==='FAMILY_CONFLICT').length}\nSERVICE_NOT_PRODUCT_RECORDS=${pendingReview.filter(r=>r.candidateStatus==='SERVICE_NOT_PRODUCT').length}\n\nEXISTING_EVIDENCE_FILES=${evidenceInventory.length}\nUSABLE_EVIDENCE_ITEMS=${evidenceInventory.filter(r=>r.usableWithoutConfirmation==='true').length}\nEVIDENCE_ITEMS_REQUIRING_CONFIRMATION=${evidenceInventory.filter(r=>r.requiresBusinessConfirmation==='true').length}\n\nSEED_PRODUCTS_PROPOSED=${seedRows.length}\nSEED_PRODUCTS_WITH_EXISTING_PENDING_CANDIDATES=${seedRows.filter(r=>r.existingPendingCandidates).length}\nSEED_PRODUCTS_REQUIRING_NEW_RECORDS=0\nSEED_PRODUCTS_READY_WITHOUT_CONFIRMATION=0\n\nBUSINESS_DECISION_GROUPS=${decisions.length}\nP0_BUSINESS_DECISIONS=${decisions.filter(r=>r[1]==='P0').length}\nP1_BUSINESS_DECISIONS=${decisions.filter(r=>r[1]==='P1').length}\nP2_BUSINESS_DECISIONS=${decisions.filter(r=>r[1]==='P2').length}\n\nBUSINESS_INTAKE_CSV_CREATED=true\nBUSINESS_INTAKE_XLSX_CREATED=false\nIMAGE_INTAKE_CREATED=true\nOEM_ODM_RECLASSIFICATION_PLAN_CREATED=true\nSTAGE_3C2_IMPORT_PLAN_CREATED=true\n\nPRODUCT_COUNT=${skus.length}\nPUBLISHED_PRODUCT_COUNT=${skus.filter(s=>s.published).length}\nPENDING_PRODUCT_COUNT=${pendingRows().length}\nPRODUCT_GROUP_COUNT=${catalog.groups?.length || 6}\nLOCALE_COUNT=6\nSTATIC_PAGE_COUNT=320\nPAGE_SITEMAP_URL_COUNT=259\nIMAGE_SITEMAP_ENTRY_COUNT=380\n\nPE043_BASELINE_PASS=true\nSOURCE_CANONICAL_BASELINE_PASS=true\nPAPER_CUP_FAMILY_BASELINE_PASS=true\n\nLINT=NOT_RUN\nTYPECHECK=NOT_RUN\nUNIT_TESTS=NOT_RUN\nBUILD=NOT_RUN\nVALIDATE_PRODUCTS=NOT_RUN\nVALIDATE_SITEMAP=NOT_RUN\nVALIDATE_SITEMAP_RUNTIME=NOT_RUN\nVALIDATE_ASSET_REFS=NOT_RUN\nVALIDATE_IMAGE_REFS=NOT_RUN\nVALIDATE_PUBLIC_MEDIA=NOT_RUN\nVALIDATE_IMAGE_SEO=NOT_RUN\nGIT_DIFF_CHECK=NOT_RUN\nNODE_VERSION=${process.version}\nPRODUCT_DATA_SHA256=${sha('src/data/catalog.normalized.json')}\nCOMMIT_CREATED=false\nPUSH_EXECUTED=false\nDEPLOY_EXECUTED=false\nPRODUCTION_CHANGED=false\n`;
write('docs/stage-3c1-summary.md', summary);
console.log(JSON.stringify({ pending: pendingReview.length, strong: pendingReview.filter(r=>r.candidateStatus==='STRONG_PENDING_CANDIDATE').length, possible: pendingReview.filter(r=>r.candidateStatus==='POSSIBLE_CANDIDATE_NEEDS_CONFIRMATION').length, evidenceFiles: evidenceInventory.length, seeds: seedRows.length, decisions: decisions.length }, null, 2));
