"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";
import type { SearchItem } from "@/content";
import { useFullscreen } from "./ShellFrame";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

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

export function TopBar({ user, search, theme }: { user: TopBarUser | null; search: SearchItem[]; theme: "light" | "dark" }) {
  const path = usePathname();
  const { toggle } = useFullscreen();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (path.startsWith("/login")) return null;
  const tabs = TABS.filter((t) => !user || user.role !== "student" || t.student);
  const items = user?.role === "student" ? search.filter((s) => s.kind === "timeline") : search;
  return (
    <header className="topbar">
      <Link href="/cards" className="brand"><img src="/brand/logo.svg" alt="" />{BRAND.name}</Link>
      <nav className="tabs">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className={`tab${path.startsWith(t.href) ? " on" : ""}`}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="grow" />
      {user && (
        <button className="search" onClick={() => setOpen(true)} type="button">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="6" cy="6" r="4.2" /><path d="M9.2 9.2L13 13" /></svg>
          <span>Пошук…</span>
          <kbd>⌘K</kbd>
        </button>
      )}
      <ThemeToggle initial={theme} />
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
      <CommandPalette items={items} open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
