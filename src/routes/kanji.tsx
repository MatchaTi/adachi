import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import Hero from '@/components/shared/hero';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { kanjiList } from '@/lib/kanji';

export const Route = createFileRoute('/kanji')({
  component: RouteComponent,
});

function RouteComponent() {
  const [query, setQuery] = useState('');

  const description =
    'Kanji are logographic characters used in Japanese writing to express core meanings in words. Start with common beginner kanji and open each detail page to review readings and essential metadata in a focused layout.';

  const filteredKanji = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return kanjiList;
    }

    return kanjiList.filter((kanji) => {
      const searchable = [
        kanji.character,
        kanji.meaning,
        kanji.onyomi,
        kanji.kunyomi,
        kanji.jlpt,
        kanji.grade,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <main>
      <Hero badge='漢字' heading='Kanji' description={description} />

      <section className='border-y border-border/70 p-4'>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Search kanji, meaning, reading, JLPT, or grade...'
        />
      </section>

      <section className='grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {filteredKanji.map((kanji) => (
          <Link
            to='/kanji/$letter'
            params={{ letter: kanji.character }}
            key={kanji.character}
          >
            <Card className='rounded-none border-border shadow-none sm:aspect-square'>
              <CardHeader>
                <CardTitle className='text-[5vh]'>{kanji.character}</CardTitle>
                <CardDescription>{kanji.meaning}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      {filteredKanji.length === 0 ? (
        <section className='border-t border-border/70 px-4 py-8'>
          <p className='text-sm text-muted-foreground'>No kanji found.</p>
        </section>
      ) : null}
    </main>
  );
}
