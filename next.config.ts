import type { NextConfig } from "next";

/** Заголовки безпеки на весь сайт (глобальні правила Михаила, §6). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  /** Продаючий лендинг — статичний HTML у public/lp, віддається на корені домену. Платформа лишається на /cards, /timelines, /tasks, /tests. */
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/lp/index.html" },
        { source: "/oferta", destination: "/lp/oferta.html" },
        { source: "/politika", destination: "/lp/politika.html" },
      ],
    };
  },
};

export default nextConfig;
