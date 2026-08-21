import type { Metadata } from "next";
import AdminLoginClient from "./AdminLoginClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
