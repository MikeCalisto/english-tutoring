"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/config/brand";
import { useFullscreen } from "./ShellFrame";

const TABS = [
  { href: "/cards", label: "Картки" },
  { href: "/timelines", label: "Таймлайни" },
  { href: "/tasks", label: "Завдання" },
  { href: "/tests", label: "Тести" },
];

export function TopBar() {
  const path = usePathname();
  const { toggle } = useFullscreen();
  return (
    <header className="topbar">
      <Link href="/cards" className="brand">{BRAND.name}</Link>
      <nav className="tabs">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={`tab${path.startsWith(t.href) ? " on" : ""}`}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="grow" />
      <button className="btn" onClick={toggle} title="На весь екран для проєктора">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" />
        </svg>
        Проєктор
      </button>
    </header>
  );
}
