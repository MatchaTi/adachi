import { toAbsoluteUrl } from '@/lib/seo';

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
};

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function renderUrlEntry(entry: SitemapEntry) {
  const parts = [`<loc>${escapeXml(toAbsoluteUrl(entry.loc))}</loc>`];

  if (entry.lastmod) {
    parts.push(`<lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
  }

  if (entry.changefreq) {
    parts.push(`<changefreq>${entry.changefreq}</changefreq>`);
  }

  if (typeof entry.priority === 'number') {
    parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
  }

  return `<url>${parts.join('')}</url>`;
}

export function buildSitemapXml(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  ${renderUrlEntry(entry)}`).join('\n')}
</urlset>`;
}

export function buildSitemapIndexXml(paths: string[]) {
  const sitemapEntries = paths.map(
    (path) =>
      `  <sitemap><loc>${escapeXml(toAbsoluteUrl(path))}</loc></sitemap>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</sitemapindex>`;
}

export function buildRobotsTxt(paths: string[]) {
  const sitemapLines = paths
    .map((path) => `Sitemap: ${toAbsoluteUrl(path)}`)
    .join('\n');

  return `User-agent: *
Allow: /

${sitemapLines}`;
}
