import type { Metadata } from "next";
import AdminInquiryDetailClient from "./AdminInquiryDetailClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminInquiryDetailClient id={id} />;
}
