"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/config/brand";
import { useFullscreen } from "./ShellFrame";

const TABS = [
  { href: "/cards", label: "Картки", student: false },
  { href: "/timelines", label: "Таймлайни", student: true },
  { href: "/tasks", label: "Завдання", student: false },
  { href: "/tests", label: "Тести", student: true },
];

export interface TopBarUser {
  name: string;
  role: "admin" | "teacher" | "student";
}

export function TopBar({ user }: { user: TopBarUser | null }) {
  const path = usePathname();
  const { toggle } = useFullscreen();
  if (path.startsWith("/login")) return null;
  const tabs = TABS.filter((t) => !user || user.role !== "student" || t.student);
  return (
    <header className="topbar">
      <Link href="/cards" className="brand">{BRAND.name}</Link>
      <nav className="tabs">
        {tabs.map((t) => (
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
      {user ? (
        <Link href="/cabinet" className={`btn${path.startsWith("/cabinet") ? " primary" : ""}`}>{user.name}</Link>
      ) : (
        <Link href="/login" className="btn">Увійти</Link>
      )}
    </header>
  );
}
