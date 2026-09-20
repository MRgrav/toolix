import type { APIRoute } from 'astro';
import { TOOLS_REGISTRY } from '../utils/toolsRegistry';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ? site.href.replace(/\/$/, '') : 'https://toolix.deolang.com';

  const routes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
    ...TOOLS_REGISTRY.map((t) => ({
      path: `/tools/${t.slug}`,
      priority: '0.9',
      changefreq: 'weekly',
    })),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
