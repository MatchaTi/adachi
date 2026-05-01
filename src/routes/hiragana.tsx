import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { FlashcardPanel } from '@/components/shared/flashcard-panel';
import Hero from '@/components/shared/hero';
import { StudyCharacterCard } from '@/components/shared/study-character-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { buildSeoHead } from '@/lib/seo';
import { orpc } from '@/orpc/client';

export const Route = createFileRoute('/hiragana')({
  head: () =>
    buildSeoHead({
      title: 'Hiragana - Adachi',
      description:
        'Learn Hiragana with interactive writing practice, flashcard drills, and searchable character grids.',
      path: '/hiragana',
    }),
  component: RouteComponent,
  pendingComponent: RoutePending,
  loader: async ({ context }) => {
    await context.queryClient.fetchQuery(
      orpc.letter.getAllHiragana.queryOptions(),
    );
  },
  errorComponent: () => <div>Error</div>,
});

function RoutePending() {
  return (
    <main className='px-4 py-10'>
      <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
        <Spinner className='size-4' />
        Loading hiragana...
      </div>
    </main>
  );
}

function RouteComponent() {
  const { data: hiragana } = useSuspenseQuery(
    orpc.letter.getAllHiragana.queryOptions(),
  );
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [isBackVisible, setIsBackVisible] = useState(false);
  const [excludeCharacter, setExcludeCharacter] = useState<string>();
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const randomCardQuery = orpc.letter.getRandomHiragana.queryOptions({
    input: {
      excludeCharacter,
    },
  });
  const { data: activeCard, isFetching: isFetchingCard } = useQuery({
    ...randomCardQuery,
    queryKey: [...randomCardQuery.queryKey, shuffleCount],
    enabled: isFlashcardOpen,
  });

  const description =
    'Used for native Japanese words and grammatical elements, Hiragana is the most basic of the three Japanese scripts. It consists of 46 characters, each representing a specific sound. Hiragana is often used in combination with Kanji (Chinese characters) to write Japanese sentences, providing phonetic readings for Kanji and serving as a foundation for learning the language.';
  const query = debouncedSearch.trim().toLowerCase();
  const filteredHiragana =
    query.length === 0
      ? hiragana
      : hiragana.filter(
          (char) =>
            char.romaji.toLowerCase().includes(query) ||
            char.character.includes(debouncedSearch.trim()),
        );

  return (
    <main>
      <Hero badge='ひらがな' heading='Hiragana' description={description} />

      <div className='sticky top-4 z-20 -mx-4 border-y border-border/70 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
        <div className='flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative flex-1'>
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

          <Dialog
            open={isFlashcardOpen}
            onOpenChange={(open) => {
              setIsFlashcardOpen(open);

              if (!open) {
                setIsBackVisible(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button type='button'>Flashcard</Button>
            </DialogTrigger>
            <DialogContent
              className='border-none bg-transparent p-0 shadow-none sm:max-w-[340px]'
              showCloseButton={false}
            >
              <DialogHeader className='sr-only'>
                <DialogTitle>Flashcard Hiragana</DialogTitle>
              </DialogHeader>

              <FlashcardPanel
                title='Learning Hiragana'
                subtitle='Basic character drill'
                frontValue={activeCard?.character || '-'}
                backValue={activeCard?.romaji || '-'}
                isBackVisible={isBackVisible}
                onFlip={() => setIsBackVisible((prev) => !prev)}
                onNext={() => {
                  setIsBackVisible(false);
                  setExcludeCharacter(activeCard?.character);
                  setShuffleCount((prev) => prev + 1);
                }}
                isNextLoading={isFetchingCard}
                disableActions={!activeCard}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <section className='mt-4 grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {filteredHiragana.map((char) => (
          <Link
            to='/hiragana/$letter'
            params={{ letter: char.character }}
            key={char.character}
          >
            <StudyCharacterCard
              character={char.character}
              badge={char.romaji}
            />
          </Link>
        ))}
      </section>
    </main>
  );
}
