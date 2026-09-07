"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface RailGroup {
  id: string;
  label: string;
  items: { id: string; label: string; href: string; available?: boolean; count?: number }[];
}

/** Левая навигация: группы времён или список таймлайнов. */
export function Rail({ groups }: { groups: RailGroup[] }) {
  const path = usePathname();
  return (
    <aside className="rail">
      {groups.map((g) => (
        <div key={g.id}>
          <div className={`rail-h ${g.id}`}>{g.label.toUpperCase()}</div>
          {g.items.map((it) =>
            it.available === false ? (
              <span key={it.id} className="dis" title="Ще не зібрано">{it.label}</span>
            ) : (
              <Link key={it.id} href={it.href} className={path === it.href ? "on" : ""}>
                <span>{it.label}</span>
                {it.count ? <span className="cnt">{it.count}</span> : null}
              </Link>
            ),
          )}
        </div>
      ))}
    </aside>
  );
}
