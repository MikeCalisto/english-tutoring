"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const FsContext = createContext<{ fs: boolean; toggle: () => void }>({ fs: false, toggle: () => {} });

export function useFullscreen() {
  return useContext(FsContext);
}

/** Оболочка: режим проектора скрывает навигацию и разворачивает карточку на весь экран. */
export function ShellFrame({ children }: { children: React.ReactNode }) {
  const [fs, setFs] = useState(false);

  const toggle = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
      setFs(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setFs(false);
    }
  }, []);

  useEffect(() => {
    const onChange = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <FsContext.Provider value={{ fs, toggle }}>
      <div className={`shell${fs ? " fs" : ""}`}>{children}</div>
    </FsContext.Provider>
  );
}
