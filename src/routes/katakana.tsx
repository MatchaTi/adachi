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

export const Route = createFileRoute('/katakana')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.fetchQuery(
      orpc.letter.getAllKatakana.queryOptions(),
    );
  },
  errorComponent: () => <div>Error Euy</div>,
});

function RouteComponent() {
  const { data: katakana } = useSuspenseQuery(
    orpc.letter.getAllKatakana.queryOptions(),
  );
  const [search, setSearch] = useState('');

  const description =
    'Primarily used for foreign loanwords, onomatopoeia, and emphasis, Katakana is one of the three Japanese writing systems. It has 46 core characters mirroring Hiragana sounds with a sharper, angular style. Katakana commonly appears in modern Japanese writing for names, technical terms, and borrowed vocabulary from other languages.';
  const query = search.trim().toLowerCase();
  const filteredKatakana =
    query.length === 0
      ? katakana
      : katakana.filter(
          (char) =>
            char.romaji.toLowerCase().includes(query) ||
            char.character.includes(search.trim()),
        );

  return (
    <main>
      <Hero badge='カタカナ' heading='Katakana' description={description}>
        <div className='relative max-w-md'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search katakana...'
            className='pl-9'
            aria-label='Search katakana'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </Hero>

      <section className='grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {filteredKatakana.map((char) => (
          <Link
            to='/katakana/$letter'
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
