import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import Hero from '@/components/shared/hero';
import { StudyCharacterCard } from '@/components/shared/study-character-card';
import { Button } from '@/components/ui/button';
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
  const [shuffleCount, setShuffleCount] = useState(0);

  const jlptQuery = orpc.kanji.getKanjiByJlptLevel.queryOptions({
    input: { level: isValidLevel ? level : 1 },
  });

  const { data, isFetching, isLoading, isError, error } = useQuery({
    ...jlptQuery,
    enabled: isValidLevel,
    queryKey: [...jlptQuery.queryKey, shuffleCount],
  });

  const kanjiList = useMemo(() => data ?? [], [data]);
  const description = `Explore the JLPT N${n} kanji set, grouped by level and presented in the same study-grid style as the main kanji index.`;
  const totalCount = kanjiList.length;
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
                ? `${totalCount} kanji found`
                : 'Select JLPT N1 through N5.'}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
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
              <RefreshCcw className={isFetching ? 'animate-spin' : undefined} />
              Refresh
            </Button>
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

      {isValidLevel && kanjiList.length > 0 ? (
        <section className='mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {kanjiList.map((char) => (
            <Link to='/kanji/$letter' params={{ letter: char }} key={char}>
              <StudyCharacterCard character={char} badge={`JLPT N${level}`} />
            </Link>
          ))}
        </section>
      ) : null}
    </main>
  );
}
