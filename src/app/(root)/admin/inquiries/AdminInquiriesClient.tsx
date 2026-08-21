"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./AdminInquiriesClient.module.css";

type Inquiry = { id: string; inquiryType: "customer_submitted" | "company_visitor_lead"; sourceLabel?: string | null; status: string; companyName?: string | null; companyDomain?: string | null; countryName?: string | null; networkType?: string | null; providerConfidence?: number | null; leadScore?: number | null; customerName?: string | null; customerEmail?: string | null; createdAt: string };
type InquiryFilter = "" | Inquiry["inquiryType"];

const typeLabels: Record<Inquiry["inquiryType"], string> = { customer_submitted: "客户主动询盘", company_visitor_lead: "企业访客识别" };
const statusLabels: Record<string, string> = { new: "新询盘", converted_to_inquiry: "已转为真实询盘", "待人工核实": "待人工核实" };

function statusLabel(status: string) { return statusLabels[status] ?? status; }

export default function AdminInquiriesClient() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [typeFilter, setTypeFilter] = useState<InquiryFilter>("");
  const [error, setError] = useState("");

  async function load(nextFilter: InquiryFilter = typeFilter) {
    const query = nextFilter ? `?type=${nextFilter}` : "";
    const response = await fetch(`/api/admin/inquiries${query}`, { cache: "no-store" });
    if (!response.ok) { setAuthenticated(false); return; }
    setAuthenticated(true);
    setInquiries(((await response.json()) as { inquiries: Inquiry[] }).inquiries);
  }

  async function login(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret }) });
    if (!response.ok) { setError("Admin access is unavailable or the secret is incorrect."); return; }
    setSecret("");
    setError("");
    await load();
  }

  useEffect(() => { void Promise.resolve().then(() => load()); }, []);

  if (!authenticated) return <main className={styles.page}><div className={styles.narrow}><h1>Inquiry administration</h1><p><Link href="/admin/login">Open admin login</Link></p><form className={styles.loginForm} onSubmit={login}><label htmlFor="admin-secret">Access secret</label><input id="admin-secret" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="current-password" /><button type="submit">Sign in</button>{error ? <p role="alert">{error}</p> : null}</form></div></main>;

  return <main className={styles.page}><div className={styles.container}><header className={styles.header}><div><p className={styles.eyebrow}>KEHONG / INTERNAL</p><h1>Inquiry administration</h1><p className={styles.description}>Review automated company visitor candidates separately from customer-submitted inquiries.</p></div><a className={styles.csvLink} href="/api/admin/inquiries.csv">Download CSV</a></header><nav className={styles.filters} aria-label="Inquiry filters"><span className={styles.filterLabel}>View</span>{[["", "全部"], ["customer_submitted", "客户主动询盘"], ["company_visitor_lead", "企业访客识别"]].map(([value, label]) => <button key={value} type="button" className={typeFilter === value ? styles.filterActive : styles.filter} onClick={() => { const next = value as InquiryFilter; setTypeFilter(next); void load(next); }}>{label}</button>)}</nav><div className={styles.tableShell}><div className={styles.tableScroll}><table><caption className={styles.srOnly}>Inquiry records</caption><thead><tr>{["Type", "Company / Customer", "Country", "Status", "Score", "Confidence", "Source", "Updated"].map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{inquiries.map((inquiry) => <tr key={inquiry.id}><td><Link className={styles.typeCell} href={`/admin/inquiries/${inquiry.id}`}><span className={`${styles.badge} ${inquiry.inquiryType === "company_visitor_lead" ? styles.visitorBadge : styles.customerBadge}`}>{typeLabels[inquiry.inquiryType]}</span></Link></td><td><Link className={styles.rowLink} href={`/admin/inquiries/${inquiry.id}`}><strong>{inquiry.companyName ?? inquiry.customerName ?? "暂未识别"}</strong><small>{inquiry.companyDomain ?? inquiry.customerEmail ?? "暂未识别"}</small></Link></td><td>{inquiry.countryName ?? "暂未识别"}</td><td><span className={styles.status}>{statusLabel(inquiry.status)}</span></td><td>{inquiry.leadScore ?? "-"}</td><td>{inquiry.providerConfidence == null ? "-" : `${Math.round(inquiry.providerConfidence * 100)}%`}</td><td>{inquiry.sourceLabel ?? "-"}</td><td>{new Date(inquiry.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{inquiries.length === 0 ? <p className={styles.empty}>No inquiry records match this view.</p> : null}</div></div></div></main>;
}
