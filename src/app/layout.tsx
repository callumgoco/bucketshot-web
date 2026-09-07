import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppState";
import { AppShell } from "@/components/Shell";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BucketShot",
  description: "Discover places to photograph, learn compositions, and plan trips.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="system" className={`${geist.variable} h-full antialiased`}>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
