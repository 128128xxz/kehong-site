"use client";

import { useState } from "react";

type Inquiry = { id: string; inquiryType: string; status: string; companyName?: string | null; companyDomain?: string | null; countryName?: string | null; industry?: string | null; networkType?: string | null; providerConfidence?: number | null; leadScore?: number | null; customerName?: string | null; customerEmail?: string | null; createdAt: string };

export default function AdminInquiriesClient() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/inquiries", { cache: "no-store" });
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

  if (!authenticated) return <main style={{ maxWidth: 480, margin: "4rem auto", padding: "1.5rem" }}><h1>Inquiry administration</h1><form onSubmit={login}><label htmlFor="admin-secret">Access secret</label><input id="admin-secret" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="current-password" style={{ display: "block", width: "100%", margin: "0.5rem 0 1rem" }} /><button type="submit">Sign in</button>{error ? <p role="alert">{error}</p> : null}</form></main>;
  return <main style={{ padding: "2rem", overflowX: "auto" }}><h1>Inquiry administration</h1><p>Visitor records are automated company-level candidates, not confirmed customer inquiries.</p><p><a href="/api/admin/inquiries.csv">Download CSV</a></p><table><thead><tr>{["Type", "Status", "Company / Customer", "Domain / Email", "Country", "Network", "Score", "Updated"].map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{inquiries.map((inquiry) => <tr key={inquiry.id}><td>{inquiry.inquiryType}</td><td>{inquiry.status}</td><td>{inquiry.companyName ?? inquiry.customerName ?? ""}</td><td>{inquiry.companyDomain ?? inquiry.customerEmail ?? ""}</td><td>{inquiry.countryName ?? ""}</td><td>{inquiry.networkType ?? ""}</td><td>{inquiry.leadScore ?? ""}</td><td>{new Date(inquiry.createdAt).toLocaleString()}</td></tr>)}</tbody></table></main>;
}
