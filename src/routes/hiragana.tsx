import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useState } from 'react';
import Hero from '@/components/shared/hero';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { orpc } from '@/orpc/client';

export const Route = createFileRoute('/hiragana')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.fetchQuery(
      orpc.letter.getAllHiragana.queryOptions(),
    );
  },
  errorComponent: () => <div>Error Euy</div>,
});

function RouteComponent() {
  const { data: hiragana } = useSuspenseQuery(
    orpc.letter.getAllHiragana.queryOptions(),
  );
  const [search, setSearch] = useState('');

  const description =
    'Used for native Japanese words and grammatical elements, Hiragana is the most basic of the three Japanese scripts. It consists of 46 characters, each representing a specific sound. Hiragana is often used in combination with Kanji (Chinese characters) to write Japanese sentences, providing phonetic readings for Kanji and serving as a foundation for learning the language.';
  const query = search.trim().toLowerCase();
  const filteredHiragana =
    query.length === 0
      ? hiragana
      : hiragana.filter(
          (char) =>
            char.romaji.toLowerCase().includes(query) ||
            char.character.includes(search.trim()),
        );

  return (
    <main>
      <Hero badge='ひらがな' heading='Hiragana' description={description}>
        <div className='relative max-w-md'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search hiragana...'
            className='pl-9'
            aria-label='Search hiragana'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </Hero>

      <section className='grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {filteredHiragana.map((char) => (
          <Link
            to='/hiragana/$letter'
            params={{ letter: char.character }}
            key={char.character}
          >
            <Card className='rounded-none border-border shadow-none sm:aspect-square'>
              <CardHeader>
                <CardTitle className='text-[5vh]'>{char.character}</CardTitle>
                <CardDescription>{char.romaji}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
