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

export const Route = createFileRoute('/katakana')({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search.q === 'string' && search.q.length > 0
      ? { q: search.q }
      : {}),
  }),
  head: () =>
    buildSeoHead({
      title: 'Katakana - Adachi',
      description:
        'Master Katakana with interactive writing practice, flashcard drills, and comprehensive character study.',
      path: '/katakana',
    }),
  component: RouteComponent,
  pendingComponent: RoutePending,
  loader: async ({ context }) => {
    await context.queryClient.fetchQuery(
      orpc.letter.getAllKatakana.queryOptions(),
    );
  },
  errorComponent: () => <div>Error</div>,
});

function RoutePending() {
  return (
    <main className='px-4 py-10'>
      <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
        <Spinner className='size-4' />
        Loading katakana...
      </div>
    </main>
  );
}

function RouteComponent() {
  const { data: katakana } = useSuspenseQuery(
    orpc.letter.getAllKatakana.queryOptions(),
  );
  const { q: search = '' } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [debouncedSearch] = useDebounce(search, 300);
  const [isBackVisible, setIsBackVisible] = useState(false);
  const [excludeCharacter, setExcludeCharacter] = useState<string>();
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const randomCardQuery = orpc.letter.getRandomKatakana.queryOptions({
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
    'Primarily used for foreign loanwords, onomatopoeia, and emphasis, Katakana is one of the three Japanese writing systems. It has 46 core characters mirroring Hiragana sounds with a sharper, angular style. Katakana commonly appears in modern Japanese writing for names, technical terms, and borrowed vocabulary from other languages.';
  const query = debouncedSearch.trim().toLowerCase();
  const filteredKatakana =
    query.length === 0
      ? katakana
      : katakana.filter(
          (char) =>
            char.romaji.toLowerCase().includes(query) ||
            char.character.includes(debouncedSearch.trim()),
        );

  return (
    <main>
      <Hero badge='カタカナ' heading='Katakana' description={description} />

      <div className='sticky top-4 z-20 -mx-4 border-y border-border/70 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
        <div className='flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search katakana...'
              className='pl-9'
              aria-label='Search katakana'
              value={search}
              onChange={(event) =>
                navigate({
                  search: event.target.value ? { q: event.target.value } : {},
                  replace: true,
                })
              }
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
                <DialogTitle>Flashcard Katakana</DialogTitle>
              </DialogHeader>

              <FlashcardPanel
                title='Learning Katakana'
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
        {filteredKatakana.map((char) => (
          <Link
            to='/katakana/$letter'
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
