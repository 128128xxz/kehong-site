"use client";

import { isAnalyticsOptedOut, setAnalyticsOptOut } from "@/lib/analyticsPrivacy";
import { useEffect, useState } from "react";

export default function PrivacySettingsButton({ label }: { label: string }) {
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the opt-out preference once from browser storage.
    setOptedOut(isAnalyticsOptedOut());
  }, []);

  function toggle() {
    const next = !optedOut;
    setAnalyticsOptOut(next);
    setOptedOut(next);
    window.dispatchEvent(new Event("kehong-analytics-preference-changed"));
  }

  return <button type="button" className="kh-inline-link text-left" aria-pressed={optedOut} onClick={toggle}>{label}</button>;
}
