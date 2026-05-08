import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, RefreshCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { orpc } from '@/orpc/client';

export const Route = createFileRoute('/jlpt_/$n')({
  head: ({ params }) =>
    buildSeoHead({
      title: `JLPT N${params.n} Kanji - Adachi`,
      description: `Study JLPT N${params.n} kanji with essential characters, readings, and meanings. Prepare for the JLPT exam with comprehensive kanji sets.`,
      path: `/jlpt/${params.n}`,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { n } = Route.useParams();
  const level = Number(n);
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= 5;
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isBackVisible, setIsBackVisible] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const jlptQuery = orpc.kanji.getKanjiByJlptLevel.queryOptions({
    input: { level: isValidLevel ? level : 1 },
  });

  const { data, isFetching, isLoading, isError, error } = useQuery({
    ...jlptQuery,
    enabled: isValidLevel,
    queryKey: [...jlptQuery.queryKey, shuffleCount],
  });

  const kanjiList = useMemo(() => data ?? [], [data]);
  const query = debouncedSearch.trim();
  const filteredKanjiList =
    query.length === 0
      ? kanjiList
      : kanjiList.filter((char) => char.includes(query));
  const description = `Explore the JLPT N${n} kanji set, grouped by level and presented in the same study-grid style as the main kanji index.`;
  const totalCount = kanjiList.length;
  const visibleCount = filteredKanjiList.length;
  const activeCardCharacter = filteredKanjiList[flashcardIndex % visibleCount];
  const cardDetailsQuery = orpc.kanji.getKanjiDetails.queryOptions({
    input: { character: activeCardCharacter ?? '' },
  });
  const { data: activeCard, isFetching: isFetchingCard } = useQuery({
    ...cardDetailsQuery,
    enabled: isFlashcardOpen && Boolean(activeCardCharacter),
  });
  const activeCardMeaning = activeCard?.meanings?.[0] ?? '-';
  const activeCardReadings = {
    on: activeCard?.on_readings?.[0] ?? '-',
    kun: activeCard?.kun_readings?.[0] ?? '-',
  };
  const activeCardFacts = [
    { label: 'Grade', value: activeCard?.grade ?? '-' },
    { label: 'JLPT', value: activeCard?.jlpt ? `N${activeCard.jlpt}` : '-' },
    { label: 'Strokes', value: activeCard?.stroke_count ?? '-' },
    { label: 'Unicode', value: activeCard?.unicode ?? '----' },
  ];
  const errorMessage =
    error instanceof Error ? error.message : 'Unable to load JLPT kanji.';

  const levelButtons = [1, 2, 3, 4, 5];

  return (
    <main>
      <Hero
        badge='日本語能力試験'
        heading={`JLPT N${n}`}
        description={description}
      />

      <div className='sticky top-4 z-20 -mx-4 border-y border-border/70 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex flex-wrap items-center gap-3'>
            <Button asChild variant='outline'>
              <Link to='/kanji'>
                <ArrowLeft />
                Kanji index
              </Link>
            </Button>
            <div className='rounded-full border border-border/70 bg-card px-3 py-1 text-xs tracking-[0.18em] text-muted-foreground uppercase'>
              {isValidLevel ? `Level N${level}` : 'Invalid level'}
            </div>
            <p className='text-sm text-muted-foreground'>
              {isValidLevel
                ? `${visibleCount} of ${totalCount} kanji found`
                : 'Select JLPT N1 through N5.'}
            </p>
          </div>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <div className='relative min-w-0 sm:w-56'>
              <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search kanji...'
                className='pl-9'
                aria-label='Search JLPT kanji'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className='flex flex-wrap items-center gap-2'>
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
                  <Button
                    type='button'
                    size='sm'
                    disabled={!isValidLevel || visibleCount === 0}
                  >
                    Flashcard
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className='border-none bg-transparent p-0 shadow-none sm:max-w-[340px]'
                  showCloseButton={false}
                >
                  <DialogHeader className='sr-only'>
                    <DialogTitle>Flashcard JLPT N{level}</DialogTitle>
                  </DialogHeader>

                  <FlashcardPanel
                    title={`JLPT N${level}`}
                    subtitle='Meaning and reading drill'
                    frontValue={activeCardCharacter ?? '-'}
                    backValue={[
                      activeCardMeaning,
                      activeCardReadings.on,
                      activeCardReadings.kun,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                    backContent={
                      <div className='flex h-full flex-col gap-3'>
                        <div className='flex items-start justify-between gap-3'>
                          <div>
                            <p className='text-[10px] tracking-[0.22em] text-muted-foreground uppercase'>
                              Kanji Detail
                            </p>
                            <p className='mt-1 font-sans-jp text-[72px] leading-none'>
                              {activeCardCharacter ?? '-'}
                            </p>
                          </div>
                          <div className='rounded-full border border-border/70 bg-background px-2.5 py-1 text-[10px] tracking-[0.2em] text-muted-foreground uppercase'>
                            N{level}
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 border-y border-border/70 py-2'>
                          <p className='text-sm leading-tight font-medium text-foreground'>
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
                      setFlashcardIndex((prev) => prev + 1);
                    }}
                    isNextLoading={isFetchingCard}
                    disableActions={!activeCardCharacter || !activeCard}
                  />
                </DialogContent>
              </Dialog>
              {levelButtons.map((itemLevel) => (
                <Button
                  key={itemLevel}
                  asChild
                  variant={itemLevel === level ? 'default' : 'outline'}
                  size='sm'
                >
                  <Link to='/jlpt/$n' params={{ n: String(itemLevel) }}>
                    N{itemLevel}
                  </Link>
                </Button>
              ))}
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => setShuffleCount((count) => count + 1)}
                disabled={!isValidLevel || isFetching}
              >
                <RefreshCcw
                  className={isFetching ? 'animate-spin' : undefined}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isError ? (
        <section className='border border-border/70 bg-card/70 p-4 shadow-none'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Error
          </p>
          <p className='mt-2 text-sm text-muted-foreground'>{errorMessage}</p>
        </section>
      ) : null}

      {!isValidLevel ? (
        <section className='border border-dashed border-border/70 bg-card/70 p-6 shadow-none'>
          <p className='text-sm text-muted-foreground'>
            JLPT level must be between N1 and N5.
          </p>
        </section>
      ) : null}

      {isLoading ? (
        <section className='border-t border-border/70 px-0 py-2'>
          <div className='mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
            <Spinner className='size-4' />
            Loading JLPT kanji...
          </div>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {Array.from(
              { length: 15 },
              (_, index) => `jlpt-skeleton-${index + 1}`,
            ).map((id) => (
              <div
                key={id}
                className='border border-border/70 bg-card/70 p-4 shadow-none'
              >
                <Skeleton className='mb-4 h-16 w-12' />
                <Skeleton className='mb-2 h-4 w-20' />
                <Skeleton className='h-3 w-16' />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {isValidLevel && !isLoading && kanjiList.length === 0 ? (
        <section className='border border-dashed border-border/70 bg-card/70 p-6 shadow-none'>
          <p className='text-sm text-muted-foreground'>
            No kanji found for this level.
          </p>
        </section>
      ) : null}

      {isValidLevel &&
      !isLoading &&
      kanjiList.length > 0 &&
      visibleCount === 0 ? (
        <section className='border border-dashed border-border/70 bg-card/70 p-6 shadow-none'>
          <p className='text-sm text-muted-foreground'>
            No kanji match your search.
          </p>
        </section>
      ) : null}

      {isValidLevel && filteredKanjiList.length > 0 ? (
        <section className='mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {filteredKanjiList.map((char) => (
            <Link to='/kanji/$letter' params={{ letter: char }} key={char}>
              <StudyCharacterCard character={char} badge={`JLPT N${level}`} />
            </Link>
          ))}
        </section>
      ) : null}
    </main>
  );
}
