"use client";

import { Check, Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { useMemo, useState } from "react";

type NewsShareToolsProps = {
  canonical: string;
  slug: string;
  title: string;
  locale: string;
};

const platforms = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
] as const;

function platformUrl(canonical: string, slug: string, platform: string) {
  const shared = new URL(canonical);
  shared.search = new URLSearchParams({
    utm_source: platform,
    utm_medium: "social",
    utm_campaign: slug,
  }).toString();
  const encoded = encodeURIComponent(shared.toString());
  if (platform === "linkedin") return `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
  if (platform === "x") return `https://x.com/intent/post?url=${encoded}&text=${encodeURIComponent(titleForShare(canonical))}`;
  if (platform === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(`${titleForShare(canonical)} ${shared.toString()}`)}`;
  return `mailto:?subject=${encodeURIComponent(titleForShare(canonical))}&body=${encodeURIComponent(shared.toString())}`;
}

function titleForShare(canonical: string) {
  return `Kehong Paper Products · ${new URL(canonical).pathname.split("/").filter(Boolean).pop() ?? "News & Insights"}`;
}

export default function NewsShareTools({ canonical, slug, title, locale }: NewsShareToolsProps) {
  const [copied, setCopied] = useState(false);
  const copyUrl = useMemo(() => {
    const url = new URL(canonical);
    url.search = new URLSearchParams({ utm_source: "copy", utm_medium: "social", utm_campaign: slug }).toString();
    return url.toString();
  }, [canonical, slug]);
  const shareTitle = title || titleForShare(canonical);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(copyUrl);
    } catch {
      const input = document.createElement("textarea");
      input.value = copyUrl;
      input.setAttribute("readonly", "true");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="kh-news-share" aria-label={locale === "zh" ? "分享文章" : "Share this article"}>
      <span className="kh-mono kh-news-share-label"><Share2 className="size-4" aria-hidden="true" />{locale === "zh" ? "分享" : "Share"}</span>
      <div className="kh-news-share-actions">
        <button type="button" className="kh-news-share-button" onClick={copyLink} aria-label={locale === "zh" ? "复制文章链接" : "Copy article link"}>
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          <span>{copied ? locale === "zh" ? "已复制" : "Copied" : locale === "zh" ? "复制链接" : "Copy link"}</span>
        </button>
        {platforms.map((platform) => {
          const href = platform.key === "x"
            ? `https://x.com/intent/post?url=${encodeURIComponent(copyUrl)}&text=${encodeURIComponent(shareTitle)}`
            : platform.key === "whatsapp"
              ? `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${copyUrl}`)}`
              : platform.key === "email"
                ? `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(copyUrl)}`
                : platformUrl(canonical, slug, platform.key);
          return (
            <a
              key={platform.key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="kh-news-share-button"
              aria-label={`${locale === "zh" ? "分享到" : "Share on"} ${platform.label}`}
            >
              {platform.key === "whatsapp" ? <MessageCircle className="size-4" aria-hidden="true" /> : platform.key === "email" ? <Mail className="size-4" aria-hidden="true" /> : <span aria-hidden="true" className="font-semibold">{platform.key === "linkedin" ? "in" : platform.key === "facebook" ? "f" : "𝕏"}</span>}
              <span>{platform.label}</span>
            </a>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">{copied ? locale === "zh" ? "文章链接已复制" : "Article link copied" : ""}</span>
    </div>
  );
}
