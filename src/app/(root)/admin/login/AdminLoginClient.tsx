"use client";

import { useState } from "react";

export default function AdminLoginClient() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (!response.ok) {
      setBusy(false);
      setError("Admin access is unavailable or the secret is incorrect.");
      return;
    }
    window.location.assign("/admin/inquiries");
  }

  return <main style={{ maxWidth: 480, margin: "4rem auto", padding: "1.5rem" }}><h1>Inquiry administration</h1><form onSubmit={login}><label htmlFor="admin-secret">Access secret</label><input id="admin-secret" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="current-password" style={{ display: "block", width: "100%", margin: "0.5rem 0 1rem" }} /><button type="submit" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>{error ? <p role="alert">{error}</p> : null}</form></main>;
}
