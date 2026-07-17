# Kehong 网站问题分析与本次可落地修复 — 2026-07-09

## 一、结论

当前包属于“安全的中间版本”，不是最终完成版本。页面视觉和代表图标注体系已经比早期版本安全，但 SKU 数据、精确图片和 SEO 基础仍有明显缺口。

核心状态：

- SKU：398
- 产品组：179
- 产品图片资产：22
- 已验证准确 SKU 图片：0
- AI/代表图 SKU：398
- 缺少 productLink 的 SKU：106
- 研究候选图片：179
- 候选图片 permissionStatus=pending：179
- 候选图片 exactnessAssessment=uncertain：179

## 二、主要问题

### 1. SKU 图片仍不是准确产品图

所有 398 个 SKU 仍使用 `ai-representative` 或代表图。当前状态是合规安全的，因为页面没有把不确定来源图片冒充为准确产品图；但业务上仍不能宣称“SKU 图片已完成”。

风险：

- 买家可能希望看到准确结构、材质、涂层、克重或尺寸对应的实拍图。
- AI 代表图只能用于类型说明，不能用于精确 SKU 证明。
- 后续任何 Codex 任务都不能把 Alibaba、ShirongPaper、竞品或未知授权图片复制到 `public/images/products`。

### 2. 产品来源覆盖不足

106 个 SKU 没有 `productLink`，集中在非 paper-cup-fan 品类：

- corrugated-fluted-paper：20
- food-packaging-box：9
- kraft-paper：10
- paper-insert：25
- paper-packaging-material：4
- paper-pad：19
- specialty-paper：6
- white-cardboard：13

风险：

- 来源缺口会影响产品可信度。
- 无法支撑准确图片升级。
- Google 与买家都更难判断页面内容的真实性和完整性。

### 3. 候选图片只能用于研究，不能进生产

`work/product-image-candidates.json` 有 179 条候选记录，但全是 pending/uncertain。当前不能进入生产图片库。

正确流程应是：

1. 确认图片所有者。
2. 确认使用授权。
3. 视觉核对是否精确匹配 SKU。
4. 只有同时满足授权与精确匹配，才允许设为 `exact`。

### 4. SEO 原始缺口较大

原包的 `sitemap.ts` 只输出首页，未包含 `/products`、`/contact`、398 个产品详情页，也没有为这些页面建立页面级 canonical / hreflang / social metadata。

影响：

- 产品详情页收录效率低。
- 多语言页面更容易出现 canonical 指向不准确。
- 分享卡片标题与描述不够精确。

### 5. 多语言细节不完整

产品类型、图片状态、来源状态主要只有中英文本。西语、印尼语、越南语、泰语、马来语页面会混入英文状态标签。

### 6. 交付包偏臃肿

上传包包含截图、工作素材、模型 backup 等非运行必需文件。它们不一定影响浏览器首屏，但会增加压缩包、仓库和部署体积。

### 7. 表单只是 mailto，不是可靠线索系统

联系页表单使用 `mailto:`。这对低成本上线可接受，但不可靠：不同浏览器和设备打开邮件客户端的行为不可控，也无法稳定记录线索。

## 三、本次已完成的可落地修复

### SEO / 收录

- 扩展 `src/app/sitemap.ts`：现在输出首页、产品目录、联系页和 398 个产品详情页，并带多语言 alternates。
- 给 `/products` 添加页面级 metadata：canonical、hreflang、Open Graph、Twitter card。
- 给 `/contact` 添加页面级 metadata：canonical、hreflang、Open Graph、Twitter card。
- 给 `/products/[slug]` 添加 SKU 级 metadata：SKU 标题、描述、canonical、hreflang、关键词、社交图片。
- 给产品详情页增加 Product JSON-LD。当前没有准确图时，不把 AI 代表图写入结构化数据的 `image` 字段，避免误导。
- 给 `/model-preview` 添加 noindex metadata，避免内部预览页参与收录。
- 首页 WebSite JSON-LD 的 URL 改为当前语言 canonical。
- `getAlternateLanguages()` 增加 `x-default`。

### 多语言 / 采购体验

- 产品图片状态、数据来源状态、产品类型标签扩展到 7 种语言。
- 修正部分 Header 多语言文案，包括西语重音、越南语声调、泰语/印尼语/马来语采购标签。
- 移动端菜单按钮增加 aria-label。
- 产品目录已选 SKU 区增加移除按钮，买家可以从 WhatsApp 询价清单中删除误选 SKU。

### 校验工具

- 新增 `scripts/validate-public-asset-refs.mjs`。
- 新增 package script：`validate:asset-refs`。
- 该脚本会检查源码/数据中引用的 `/images` 与 `/models` 是否存在，避免 3D 模型或图片链接漏文件。

### 交付清理

- 输出压缩包排除了 `screenshots/`、`.next/`、`node_modules/`、`tsconfig.tsbuildinfo`、`.superpowers/`、`public/models/backup/`、`work/kohon_intro/` 等非交付文件。

## 四、本次校验结果

已运行不依赖 node_modules 的校验：

```bash
node scripts/validate-product-assets.mjs
node scripts/validate-public-image-refs.mjs
node scripts/validate-public-asset-refs.mjs
node scripts/audit-product-data.mjs
node scripts/validate-ai-generated-assets.mjs
node scripts/validate-candidate-images.mjs
```

结果摘要：

- 产品资产校验：0 errors，2 warnings
- 图片引用校验：0 missing image references
- 图片/模型引用校验：0 missing public asset references
- AI 代表图校验：0 errors，0 warnings
- 候选图片校验：0 errors，1 warning
- 当前仍有 0 个准确 SKU 图片、106 个 SKU 缺少 productLink、179 条候选图片权限待确认

未运行：

```bash
pnpm lint
pnpm build
```

原因：当前容器没有 pnpm，尝试通过 corepack 获取 pnpm 时网络不可用；并且本机 Node 为 22.16.0，而 `package.json` 声明 `node: 24.x`。请在有依赖和 Node 24 的环境中补跑。

## 五、下一步优先级

1. 先补 106 个缺失 productLink，不要继续做视觉动效。
2. 建立准确 SKU 图片审批表：图片来源、授权、直接图片 URL、对应 SKU、核对人、核对时间。
3. 只把已授权且准确匹配 SKU 的图片放入 `public/images/products/verified/`。
4. 将对应图片资产写入 `src/data/productImages.json`，并将 SKU mapping 改为 `imageStatus: exact`。
5. 跑完整校验：`validate:product-assets`、`validate:image-refs`、`validate:asset-refs`、`validate:ai-assets`、`validate:image-candidates`、`audit:product-data`、`lint`、`build`。
6. 最后再考虑表单后端、CRM、性能监控和转化率实验。
