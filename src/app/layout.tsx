import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Onest } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/config/brand";
import { TopBar } from "@/components/shell/TopBar";
import { ShellFrame } from "@/components/shell/ShellFrame";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const body = Onest({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description: BRAND.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ShellFrame>
          <TopBar />
          {children}
        </ShellFrame>
      </body>
    </html>
  );
}
