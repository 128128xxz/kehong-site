"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./AdminInquiryDetailClient.module.css";

type InquiryRecord = {
  id: string;
  inquiryType?: string;
  status?: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerMessage?: string | null;
  companyName?: string | null;
  companyDomain?: string | null;
  countryName?: string | null;
  industry?: string | null;
  employeeRange?: string | null;
  networkType?: string | null;
  providerConfidence?: number | null;
  leadScore?: number | null;
  scoreReasons?: Array<{ label?: string; reason?: string; points?: number }>;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  totalVisits?: number | null;
  totalEvents?: number | null;
  firstReferrer?: string | null;
  latestReferrer?: string | null;
  firstUtmSource?: string | null;
  latestUtmSource?: string | null;
  sourceLabel?: string | null;
  createdAt?: string;
  updatedAt?: string;
  linkedInquiryId?: string | null;
};

type VisitorEvent = {
  id?: string;
  eventType?: string;
  path?: string;
  occurredAt?: string;
  referrer?: string | null;
  utm?: Record<string, string | null> | null;
  metadata?: Record<string, unknown> | null;
};

type VisitorLead = {
  id: string;
  companyName?: string | null;
  companyDomain?: string | null;
  countryName?: string | null;
  industry?: string | null;
  employeeRange?: string | null;
  networkType?: string | null;
  providerConfidence?: number | null;
  leadScore?: number | null;
  scoreReasons?: Array<{ label?: string; reason?: string; points?: number }>;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  totalVisits?: number | null;
  totalEvents?: number | null;
  firstReferrer?: string | null;
  latestReferrer?: string | null;
  firstUtmSource?: string | null;
  latestUtmSource?: string | null;
  notificationStatus?: string | null;
  events?: VisitorEvent[];
  linkedInquiryId?: string | null;
};

type DetailResponse = {
  inquiry: InquiryRecord;
  linkedInquiry?: InquiryRecord | null;
  visitorLead?: VisitorLead | null;
  events?: VisitorEvent[];
  notificationStatus?: string | null;
};

const statusLabels: Record<string, string> = {
  new: "新询盘",
  converted_to_inquiry: "已转为真实询盘",
  company_visitor_lead: "待人工核实",
};

const eventLabels: Record<string, string> = {
  page_view: "页面访问",
  product_view: "产品查看",
  contact_view: "联系页面查看",
  whatsapp_click: "WhatsApp 点击",
  quote_start: "开始询价",
};

function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "暂未识别";
  return String(value);
}

function formatDate(value?: string | null) {
  if (!value) return "暂未识别";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function formatConfidence(value?: number | null) {
  if (value === null || value === undefined) return "暂未识别";
  return `${Math.round(value * 100)}%`;
}

function typeLabel(inquiry?: InquiryRecord) {
  return inquiry?.inquiryType === "company_visitor_lead" ? "企业访客识别" : "客户主动询盘";
}

function statusLabel(status?: string) {
  return statusLabels[status || ""] || display(status);
}

function DetailField({ label, value }: { label: string; value?: unknown }) {
  return (
    <div className={styles.field}>
      <dt>{label}</dt>
      <dd>{display(value)}</dd>
    </div>
  );
}

function ScoreReason({ reason }: { reason: { label?: string; reason?: string; points?: number } }) {
  const points = Number(reason.points || 0);
  return (
    <li className={points >= 0 ? styles.positiveReason : styles.negativeReason}>
      <span>{display(reason.label || reason.reason)}</span>
      <strong>{points >= 0 ? `+${points}` : points}</strong>
    </li>
  );
}

export default function AdminInquiryDetailClient({ id }: { id: string }) {
  const [data, setData] = useState<DetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return (await response.json()) as DetailResponse;
      })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "加载失败");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <main className={styles.shell}><p className={styles.error}>{error}</p></main>;
  if (!data) return <main className={styles.shell}><p className={styles.loading}>正在加载询盘详情...</p></main>;

  const inquiry = data.inquiry;
  const isVisitor = inquiry.inquiryType === "company_visitor_lead";
  const visitor = isVisitor ? (inquiry as InquiryRecord & VisitorLead) : null;
  const events = data.events || [];
  const linkedInquiry = data.linkedInquiry;

  return (
    <main className={styles.shell}>
      <div className={styles.backRow}>
        <Link href="/admin/inquiries" className={styles.backLink}>← 返回询盘列表</Link>
      </div>

      <header className={styles.hero}>
        <div>
          <div className={styles.badges}>
            <span className={isVisitor ? styles.visitorBadge : styles.customerBadge}>{typeLabel(inquiry)}</span>
            <span className={styles.statusBadge}>{statusLabel(inquiry.status)}</span>
          </div>
          <h1>{display(isVisitor ? visitor?.companyName : inquiry.companyName || inquiry.customerName)}</h1>
          <p className={styles.subtle}>{isVisitor ? display(visitor?.companyDomain) : display(inquiry.customerEmail)}</p>
        </div>
        {isVisitor && (
          <div className={styles.metrics}>
            <div><span>Lead Score</span><strong>{display(visitor?.leadScore)}</strong></div>
            <div><span>Confidence</span><strong>{formatConfidence(visitor?.providerConfidence)}</strong></div>
          </div>
        )}
      </header>

      {isVisitor ? (
        <>
          <section className={styles.riskNotice}>
            <strong>风险提示</strong>
            <p>这是基于企业网络识别的访客线索，尚未由客户主动提交询盘。请人工核实后再联系。</p>
          </section>

          <section className={styles.section}>
            <h2>Company profile</h2>
            <dl className={styles.grid}>
              <DetailField label="Company" value={visitor?.companyName} />
              <DetailField label="Domain" value={visitor?.companyDomain} />
              <DetailField label="Country" value={visitor?.countryName} />
              <DetailField label="Industry" value={visitor?.industry} />
              <DetailField label="Employees" value={visitor?.employeeRange} />
              <DetailField label="Network" value={visitor?.networkType} />
            </dl>
          </section>

          <section className={styles.section}>
            <h2>Contact</h2>
            <dl className={styles.grid}>
              <DetailField label="Name" value={null} />
              <DetailField label="Email" value={null} />
              <DetailField label="Phone" value={null} />
              <DetailField label="Message" value={null} />
            </dl>
          </section>

          <section className={styles.section}>
            <h2>Score reasons</h2>
            <ul className={styles.reasons}>
              {(visitor?.scoreReasons || []).map((reason, index) => <ScoreReason key={`${reason.label}-${index}`} reason={reason} />)}
              {!visitor?.scoreReasons?.length && <li className={styles.empty}>暂未识别</li>}
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Visitor activity</h2>
            <dl className={styles.grid}>
              <DetailField label="First seen" value={formatDate(visitor?.firstSeenAt)} />
              <DetailField label="Last seen" value={formatDate(visitor?.lastSeenAt)} />
              <DetailField label="Visits" value={visitor?.totalVisits} />
              <DetailField label="Events" value={visitor?.totalEvents ?? events.length} />
              <DetailField label="Referrer" value={visitor?.latestReferrer || visitor?.firstReferrer} />
              <DetailField label="UTM source" value={visitor?.latestUtmSource || visitor?.firstUtmSource} />
              <DetailField label="Notification" value={data.notificationStatus || visitor?.notificationStatus} />
            </dl>
          </section>

          <section className={styles.section}>
            <h2>Timeline</h2>
            <div className={styles.timeline}>
              {events.map((event, index) => (
                <div className={styles.timelineItem} key={event.id || `${event.eventType}-${index}`}>
                  <time>{formatDate(event.occurredAt)}</time>
                  <div><strong>{eventLabels[event.eventType || ""] || display(event.eventType)}</strong><span>{display(event.path)}</span></div>
                </div>
              ))}
              {!events.length && <p className={styles.empty}>暂无访问事件</p>}
            </div>
          </section>

          {linkedInquiry && (
            <section className={styles.linkedCard}>
              <span className={styles.eyebrow}>已关联真实询盘</span>
              <strong>{display(linkedInquiry.companyName || linkedInquiry.customerName)}</strong>
              <Link href={`/admin/inquiries/${linkedInquiry.id}`}>查看询盘 →</Link>
            </section>
          )}
        </>
      ) : (
        <>
          <section className={styles.section}>
            <h2>Customer inquiry</h2>
            <dl className={styles.grid}>
              <DetailField label="Customer name" value={inquiry.customerName} />
              <DetailField label="Email" value={inquiry.customerEmail} />
              <DetailField label="Phone" value={inquiry.customerPhone} />
              <DetailField label="Company" value={inquiry.companyName} />
              <DetailField label="Country" value={inquiry.countryName} />
            </dl>
            <div className={styles.message}><span>Message</span><p>{display(inquiry.customerMessage)}</p></div>
          </section>
          {linkedInquiry && (
            <section className={styles.linkedCard}>
              <span className={styles.eyebrow}>此前企业访客记录</span>
              <strong>{display(linkedInquiry.companyName || linkedInquiry.customerName)}</strong>
              <Link href={`/admin/inquiries/${linkedInquiry.id}`}>查看访问记录 →</Link>
            </section>
          )}
        </>
      )}
    </main>
  );
}
