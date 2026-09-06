import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Onest } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/config/brand";
import { TopBar } from "@/components/shell/TopBar";
import { ShellFrame } from "@/components/shell/ShellFrame";
import { getCurrentUser } from "@/lib/auth";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["700", "800"] });
const body = Onest({ variable: "--font-body", subsets: ["latin", "cyrillic"], weight: ["400", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description: BRAND.tagline,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await getCurrentUser().catch(() => null);
  const user = u ? { name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "Кабінет", role: u.role } : null;
  return (
    <html lang="uk" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ShellFrame>
          <TopBar user={user} />
          {children}
        </ShellFrame>
      </body>
    </html>
  );
}
