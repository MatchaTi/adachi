import { createFileRoute } from '@tanstack/react-router';
import { buildSitemapXml } from '@/lib/sitemap';
import {
  listHiragana,
  listKanji,
  listKatakana,
} from '@/orpc/router/letter/letter-services';

function uniqueCharacters(characters: string[]) {
  return [...new Set(characters.filter(Boolean))];
}

export const Route = createFileRoute('/sitemap-dynamic.xml')({
  server: {
    handlers: {
      GET: async () => {
        const hiraganaEntries = uniqueCharacters(
          listHiragana().map((item) => item.character),
        ).map((character) => ({
          loc: `/hiragana/${character}`,
          changefreq: 'yearly' as const,
          priority: 0.6,
        }));

        const katakanaEntries = uniqueCharacters(
          listKatakana().map((item) => item.character),
        ).map((character) => ({
          loc: `/katakana/${character}`,
          changefreq: 'yearly' as const,
          priority: 0.6,
        }));

        const kanjiEntries = uniqueCharacters(
          listKanji().map((item) => item.character),
        ).map((character) => ({
          loc: `/kanji/${character}`,
          changefreq: 'monthly' as const,
          priority: 0.5,
        }));

        const jlptEntries = [1, 2, 3, 4, 5].map((level) => ({
          loc: `/jlpt/${level}`,
          changefreq: 'monthly' as const,
          priority: 0.7,
        }));

        const joyoEntries = [1, 2, 3, 4, 5, 6].map((grade) => ({
          loc: `/joyo/${grade}`,
          changefreq: 'monthly' as const,
          priority: 0.7,
        }));

        const sitemap = buildSitemapXml([
          ...hiraganaEntries,
          ...katakanaEntries,
          ...kanjiEntries,
          ...jlptEntries,
          ...joyoEntries,
        ]);

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml; charset=UTF-8',
          },
        });
      },
    },
  },
});
