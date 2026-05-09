import type { Collection } from "@workspace/db";

const SITE_URL = process.env.SITE_URL || "https://www.thevespera.online";

export function buildSitemapXml(pieces: Collection[]): string {
  const staticPaths = ["/", "/collection", "/our-story", "/client-care", "/legal", "/appointments", "/track"];
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    ...staticPaths.map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`),
    ...pieces
      .filter((p) => p.isActive)
      .map((p) => `  <url><loc>${SITE_URL}/collection/${p.slug}</loc><lastmod>${new Date(p.updatedAt).toISOString().slice(0,10)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
}

export function buildRobotsTxt(): string {
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}
