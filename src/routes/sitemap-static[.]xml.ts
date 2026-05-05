import { createFileRoute } from '@tanstack/react-router';
import { buildSitemapXml } from '@/lib/sitemap';

const STATIC_SITEMAP_ENTRIES = [
  { loc: '/', priority: 1.0, changefreq: 'weekly' },
  { loc: '/hiragana', priority: 0.9, changefreq: 'weekly' },
  { loc: '/katakana', priority: 0.9, changefreq: 'weekly' },
  { loc: '/kanji', priority: 0.9, changefreq: 'weekly' },
  { loc: '/jlpt', priority: 0.8, changefreq: 'monthly' },
  { loc: '/joyo', priority: 0.8, changefreq: 'monthly' },
  { loc: '/kotowaza', priority: 0.8, changefreq: 'monthly' },
  { loc: '/analyze', priority: 0.7, changefreq: 'monthly' },
  { loc: '/about', priority: 0.5, changefreq: 'yearly' },
  { loc: '/disclaimer', priority: 0.3, changefreq: 'yearly' },
] satisfies Parameters<typeof buildSitemapXml>[0];

export const Route = createFileRoute('/sitemap-static.xml')({
  server: {
    handlers: {
      GET: async () => {
        const sitemap = buildSitemapXml(STATIC_SITEMAP_ENTRIES);

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml; charset=UTF-8',
          },
        });
      },
    },
  },
});
