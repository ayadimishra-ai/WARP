"use client";

import { Suspense } from "react";
import { ModalsProvider } from "@mantine/modals";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalsProvider>
      <div>
        <main>{children}</main>
      </div>
    </ModalsProvider>
  );
}
