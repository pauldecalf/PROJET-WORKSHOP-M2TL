import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation - Swagger UI",
  description: "Documentation interactive de l'API Workshop IoT",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Désactivation du StrictMode pour cette page uniquement
  // car Swagger UI utilise des API React obsolètes
  return <>{children}</>;
}

