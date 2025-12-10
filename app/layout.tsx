import { AppLayout } from "@/components/AppLayout";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "RoomScan - Campus IoT",
  description: "Real-time room monitoring system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
