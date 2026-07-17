# Kehong 官网修复报告

## 已完成

- 统一站点 URL 默认值为 `https://www.kehong.tech`，旧域名扫描为 0。
- 产品数据重新生成：398 个 SKU、109 个产品组；SKU 与 slug 无重复。
- 清理产品数据中的来源说明、平台内部表述和未确认英文；英文 CJK 校验通过。
- 产品目录支持 `category`、`productType`、`material`、`gsm`、`coating`、`process`、`customizable`、`search`、`page` URL 参数。
- 服务端筛选与分页，每页最多 24 个产品组；筛选状态可复制、刷新和返回。
- 增加固定产品分类路径，例如 `/en/products/kraft-paper`。
- 产品详情按产品组聚合变体，移除重复报价信息模块，加入 Product 与 BreadcrumbList JSON-LD。
- 询盘表单加入电话、WhatsApp、数量、尺寸、材质、GSM、印刷、后工艺、目标市场、附件、隐私确认、来源 URL 与 UTM 字段。
- 询盘 API 支持 multipart 文件、10 MB 限制、类型校验、honeypot、频率限制和相同邮箱+产品组合去重，邮件收件人为 `info@kehong.tech`（需配置 Resend）。
- 增加独立 `/factory`、`/process`、`/procurement`、`/privacy`、`/terms` 页面。
- 页头、页脚改为真实站内路径；移除无真实目标的社媒和微信入口；补充隐私政策、使用条款和版权信息。
- 增加 reduced-motion 支持；代表图片统一标注为 `Reference rendering` / `参考渲染图`。
- Sitemap 包含独立页、分类页和产品详情页；筛选/搜索结果设置 noindex。

## 验证结果

- `pnpm lint`：通过。
- `pnpm build`：通过，TypeScript 和静态页面生成通过。
- `pnpm validate:catalog`：通过，0 个阻断错误。
- `pnpm validate:product-assets`：0 个错误；仅提示当前均为代表图，没有精确 SKU 实拍。
- `pnpm validate:asset-refs`：0 个缺失资源引用。

## 需要上线前配置

在 Vercel 的 Production 环境配置：

```bash
NEXT_PUBLIC_SITE_URL=https://www.kehong.tech
RESEND_API_KEY=...
INQUIRY_FROM_EMAIL=info@kehong.tech
INQUIRY_TO_EMAIL=info@kehong.tech
```

当前没有把任何未确认的社媒、地址、认证或精确 SKU 图片写入网站；如需展示，应先提供可验证资料。
