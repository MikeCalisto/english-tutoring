"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";
import type { SearchItem } from "@/content";
import { Icon } from "@/components/Icon";
import { useFullscreen } from "./ShellFrame";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

const TABS = [
  { href: "/cards", label: "Картки", icon: "cards", key: "cards", student: false },
  { href: "/timelines", label: "Таймлайни", icon: "timeline", key: "timelines", student: true },
  { href: "/mindmap", label: "Майндмеп", icon: "mindmap", key: "mindmap", student: false },
  { href: "/tasks", label: "Завдання", icon: "tasks", key: "tasks", student: false },
  { href: "/tests", label: "Тести", icon: "tests", key: "tests", student: true },
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

  if (path === "/" || path.startsWith("/login")) return null;
  const tabs = TABS.filter((t) => !user || user.role !== "student" || t.student);
  const items = user?.role === "student" ? search.filter((s) => s.kind === "timeline") : search;
  return (
    <header className="topbar">
      <Link href="/cards" className="brand"><img src="/brand/logo.svg" alt="" />{BRAND.name}</Link>
      <nav className="tabs" data-tour="tabs">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} data-tour={`tab-${t.key}`} className={`tab${path.startsWith(t.href) ? " on" : ""}`}>
            <Icon name={t.icon} />
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="grow" />
      <div className="top-actions" data-tour="actions">
        {user && (
          <button className="search" onClick={() => setOpen(true)} type="button">
            <Icon name="search" size={14} />
            <span>Пошук…</span>
            <kbd>⌘K</kbd>
          </button>
        )}
        <ThemeToggle initial={theme} />
        {user && (
          <button className="theme-btn" type="button" title="Як користуватись платформою" aria-label="Показати навчання" onClick={() => window.dispatchEvent(new Event("tour:start"))}>
            <Icon name="help" />
          </button>
        )}
        <button className="btn" onClick={toggle} title="На весь екран для проєктора" type="button">
          <Icon name="expand" size={14} />
          Проєктор
        </button>
        {user ? (
          <Link href="/cabinet" className={`btn${path.startsWith("/cabinet") ? " primary" : ""}`}><Icon name="user" size={14} />{user.name}</Link>
        ) : (
          <Link href="/login" className="btn">Увійти</Link>
        )}
      </div>
      <CommandPalette items={items} open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
