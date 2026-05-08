import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { buildSeoHead } from '@/lib/seo';
import { client, orpc } from '@/orpc/client';

export const Route = createFileRoute('/kanji')({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search.q === 'string' && search.q.length > 0
      ? { q: search.q }
      : {}),
  }),
  head: () =>
    buildSeoHead({
      title: 'Kanji - Adachi',
      description:
        'Study kanji with animated stroke order, interactive writing practice, and flashcard drills.',
      path: '/kanji',
    }),
  component: RouteComponent,
  errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
  const { q: search = '' } = Route.useSearch();
  const navigate = Route.useNavigate();
  const normalizedQuery = search.trim();
  const [query] = useDebounce(normalizedQuery, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isBackVisible, setIsBackVisible] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const randomCardQuery = orpc.kanji.getRandomKanji.queryOptions();
  const { data: activeCard, isFetching: isFetchingCard } = useQuery({
    ...randomCardQuery,
    queryKey: [...randomCardQuery.queryKey, shuffleCount],
    enabled: isFlashcardOpen,
  });

  const activeCardTitle = activeCard?.kanji ?? '-';
  const activeCardMeaning = activeCard?.meanings?.[0] ?? '-';
  const activeCardReadings = {
    on: activeCard?.on_readings?.[0] ?? '-',
    kun: activeCard?.kun_readings?.[0] ?? '-',
  };
  const activeCardFacts = [
    { label: 'Grade', value: activeCard?.grade ?? '-' },
    { label: 'JLPT', value: activeCard?.jlpt ? `N${activeCard.jlpt}` : '-' },
    {
      label: 'Freq',
      value: activeCard?.freq_mainichi_shinbun ?? '-',
    },
    { label: 'Strokes', value: activeCard?.stroke_count ?? '-' },
  ];

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ['kanji', 'infinite', query],
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        client.kanji.getKanjiPage({
          cursor: pageParam,
          limit: 40,
          search: query,
        }),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const description =
    'Kanji and related components can be complex, but writing practice helps build recognition quickly. Browse the character set and open any item to study animated stroke order and practice drawing directly on the canvas.';

  const kanjiList = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (!first?.isIntersecting || !hasNextPage || isFetchingNextPage) {
          return;
        }

        void fetchNextPage();
      },
      {
        rootMargin: '200px',
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <main>
      <Hero badge='漢字' heading='Kanji' description={description} />

      <div className='sticky top-4 z-20 -mx-4 border-y border-border/70 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
        <div className='flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search kanji, meaning, or reading...'
              className='pl-9'
              aria-label='Search kanji'
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
                <DialogTitle>Flashcard Kanji</DialogTitle>
              </DialogHeader>

              <FlashcardPanel
                title='Learning the Kanji'
                subtitle='Meaning and reading drill'
                frontValue={activeCardTitle}
                backValue={
                  [
                    activeCardMeaning,
                    activeCardReadings.on,
                    activeCardReadings.kun,
                  ]
                    .filter(Boolean)
                    .join(' • ') || '-'
                }
                backContent={
                  <div className='flex h-full flex-col gap-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='text-[10px] tracking-[0.22em] text-muted-foreground uppercase'>
                          Kanji Detail
                        </p>
                        <p className='mt-1 font-sans-jp text-[72px] leading-none'>
                          {activeCardTitle}
                        </p>
                      </div>
                      <div className='rounded-full border border-border/70 bg-background px-2.5 py-1 text-[10px] tracking-[0.2em] text-muted-foreground uppercase'>
                        {activeCard?.unicode ?? '----'}
                      </div>
                    </div>

                    <div className='space-y-2 border-y border-border/70 py-2'>
                      <p className='text-sm font-medium leading-tight text-foreground'>
                        {activeCardMeaning}
                      </p>
                      <div className='flex flex-wrap gap-2 text-xs'>
                        <span className='border border-border/70 bg-foreground px-2 py-1 text-background'>
                          ON {activeCardReadings.on}
                        </span>
                        <span className='border border-border/70 bg-background px-2 py-1'>
                          KUN {activeCardReadings.kun}
                        </span>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                      {activeCardFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className='border border-border/70 bg-background px-2 py-2'
                        >
                          <p className='text-[10px] tracking-[0.2em] text-muted-foreground uppercase'>
                            {fact.label}
                          </p>
                          <p className='mt-1 text-sm font-medium'>
                            {fact.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                }
                isBackVisible={isBackVisible}
                onFlip={() => setIsBackVisible((prev) => !prev)}
                onNext={() => {
                  setIsBackVisible(false);
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
        {kanjiList.map((char) => (
          <Link to='/kanji/$letter' params={{ letter: char }} key={char}>
            <StudyCharacterCard character={char} badge='Kanji' />
          </Link>
        ))}
      </section>

      {isLoading ? (
        <section className='border-t border-border/70 px-4 py-8'>
          <div className='mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
            <Spinner className='size-4' />
            Loading kanji...
          </div>
          <div className='grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {Array.from(
              { length: 10 },
              (_, index) => `loading-${index + 1}`,
            ).map((id) => (
              <div key={id} className='border border-border p-6'>
                <Skeleton className='mb-4 h-14 w-12' />
                <Skeleton className='mb-2 h-4 w-20' />
                <Skeleton className='h-3 w-28' />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading && kanjiList.length === 0 ? (
        <section className='border-t border-border/70 px-4 py-8'>
          <p className='text-sm text-muted-foreground'>No kanji found.</p>
        </section>
      ) : null}

      {kanjiList.length > 0 ? (
        <section className='border-t border-border/70 px-4 py-6'>
          <div ref={loadMoreRef} className='h-6' />
          {isFetchingNextPage ? (
            <p className='flex items-center justify-center gap-2 text-center text-sm text-muted-foreground'>
              <Spinner className='size-4' />
              Loading more...
            </p>
          ) : null}
          {!hasNextPage && !isLoading ? (
            <p className='text-center text-xs text-muted-foreground'>
              You have reached the end.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
