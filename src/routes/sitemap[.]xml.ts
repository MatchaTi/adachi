import { createFileRoute } from '@tanstack/react-router';
import { buildSitemapIndexXml } from '@/lib/sitemap';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const sitemapIndex = buildSitemapIndexXml([
          '/sitemap-static.xml',
          '/sitemap-dynamic.xml',
        ]);

        return new Response(sitemapIndex, {
          headers: {
            'Content-Type': 'application/xml; charset=UTF-8',
          },
        });
      },
    },
  },
});
