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
  /** Корінь домену веде в платформу (src/app/page.tsx). Продаючий лендинг пака — статичний HTML у public/lp, віддається на /pack. */
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/pack", destination: "/lp/index.html" },
        { source: "/oferta", destination: "/lp/oferta.html" },
        { source: "/politika", destination: "/lp/politika.html" },
      ],
    };
  },
};

export default nextConfig;
