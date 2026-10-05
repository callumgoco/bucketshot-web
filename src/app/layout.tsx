import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppState";
import { AppShell } from "@/components/Shell";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({ variable: "--font-instrument-serif", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "BucketShot",
  description: "Discover places to photograph, learn compositions, and plan trips.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="system" className={`${geist.variable} ${instrumentSerif.variable} h-full antialiased`}>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
