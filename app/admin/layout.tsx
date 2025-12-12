import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration - Digital Campus IoT",
  description: "Dashboard de supervision et gestion des devices IoT",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

