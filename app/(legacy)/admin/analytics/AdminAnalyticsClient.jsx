"use client";

import dynamic from "next/dynamic";

const AnalyticsDashboard = dynamic(() => import("@/components/admin/AnalyticsDashboard"), {
  ssr: false,
  loading: () => <div style={{ opacity: 0.75 }}>Laen andmeid...</div>,
});

export default function AdminAnalyticsClient() {
  return <AnalyticsDashboard />;
}
