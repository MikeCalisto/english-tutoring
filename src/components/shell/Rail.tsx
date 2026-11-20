"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

export interface RailGroup {
  id: string;
  label: string;
  items: { id: string; label: string; href: string; available?: boolean; count?: number; icon?: string }[];
}

/** Левая навигация: группы времён или список таймлайнов. */
export function Rail({ groups }: { groups: RailGroup[] }) {
  const path = usePathname();
  return (
    <aside className="rail" data-tour="rail">
      {groups.map((g) => (
        <div key={g.id} className={`g-${g.id}`}>
          <div className={`rail-h ${g.id}`}><i />{g.label.toUpperCase()}</div>
          {g.items.map((it) =>
            it.available === false ? (
              <span key={it.id} className="dis" title="Ще не зібрано"><span className="lbl">{it.icon && <Icon name={it.icon} />}{it.label}</span></span>
            ) : (
              <Link key={it.id} href={it.href} className={path === it.href ? "on" : ""}>
                <span className="lbl">{it.icon && <Icon name={it.icon} />}{it.label}</span>
                {it.count ? <span className="cnt">{it.count}</span> : null}
              </Link>
            ),
          )}
        </div>
      ))}
    </aside>
  );
}
