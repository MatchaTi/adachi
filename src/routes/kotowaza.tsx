import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, RefreshCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Heading } from '@/components/shared/heading';
import Hero from '@/components/shared/hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { buildSeoHead } from '@/lib/seo';
import { orpc } from '@/orpc/client';

export const Route = createFileRoute('/kotowaza')({
  head: () =>
    buildSeoHead({
      title: 'Kotowaza - Japanese Proverbs - Adachi',
      description:
        'Explore curated Japanese proverbs with meanings, equivalents, examples, and contextual usage.',
      path: '/kotowaza',
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const [shuffleCount, setShuffleCount] = useState(0);

  const randomKotowazaQuery = orpc.kanji.getRandomKotowaza.queryOptions();
  const {
    data: kotowaza,
    isFetching,
    isError,
    error,
  } = useQuery({
    ...randomKotowazaQuery,
    queryKey: [...randomKotowazaQuery.queryKey, shuffleCount],
  });

  const examples = kotowaza?.examples ?? [];
  const tags = kotowaza?.tags ?? [];
  const related = kotowaza?.related ?? [];
  const message =
    error instanceof Error
      ? error.message
      : 'Kotowaza acak belum tersedia saat ini.';

  const description =
    'Generate a random kotowaza, read the Japanese phrase, and study its meaning, literal sense, and related notes in one focused view.';

  return (
    <main>
      <Hero badge='ことわざ' heading='Kotowaza' description={description}>
        <div className='flex flex-wrap gap-3'>
          <Button
            type='button'
            onClick={() => setShuffleCount((count) => count + 1)}
            disabled={isFetching}
            className='min-w-40'
          >
            <RefreshCcw className={isFetching ? 'animate-spin' : undefined} />
            Generate another
          </Button>
          <Button asChild variant='outline'>
            <Link to='/kanji'>
              <ArrowRight />
              Study kanji
            </Link>
          </Button>
        </div>
      </Hero>

      {isError ? (
        <Card className='border-border bg-card/70 p-4 shadow-none'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Error
          </p>
          <p className='mt-2 text-sm text-muted-foreground'>{message}</p>
        </Card>
      ) : null}

      <section className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <Card className='overflow-hidden rounded-none border-border bg-card/70 shadow-none'>
          <div className='border-b border-border/60 px-5 py-4 sm:px-6'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
                  Kotowaza Detail
                </p>
                <h2 className='mt-1 text-2xl leading-none sm:text-3xl'>
                  {isFetching && !kotowaza
                    ? 'Loading...'
                    : (kotowaza?.japanese ?? '-')}
                </h2>
              </div>
              <Badge variant={'outline'}>
                <Sparkles className='size-4' />
                Random
              </Badge>
            </div>
          </div>

          <div className='grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]'>
            <div className='relative flex min-h-[280px] items-center justify-center border-b border-border/60 bg-background p-6 lg:border-b-0 lg:border-r'>
              <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50' />
              <div className='relative flex flex-col items-center gap-3 text-center'>
                <p className='font-sans-jp text-[88px] leading-none sm:text-[112px]'>
                  {kotowaza?.japanese ?? '—'}
                </p>
                <p className='text-xs tracking-[0.22em] text-muted-foreground uppercase'>
                  {kotowaza?.romaji ?? 'Waiting for a proverb'}
                </p>
              </div>
            </div>

            <div className='space-y-6 p-5 sm:p-6'>
              <div className='space-y-3'>
                <p className='text-[11px] tracking-[0.24em] text-muted-foreground uppercase'>
                  Meaning
                </p>
                <Heading
                  level='h3'
                  className='text-3xl leading-tight sm:text-4xl'
                >
                  {kotowaza?.meaning?.en ?? 'Generate a proverb to start.'}
                </Heading>
                <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
                  {kotowaza?.equivalent?.en ??
                    kotowaza?.literal ??
                    'The literal explanation appears here once the random proverb loads.'}
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='border border-border/70 bg-background p-4'>
                  <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                    Reading
                  </p>
                  <p className='mt-2 text-lg font-medium'>
                    {kotowaza?.reading ?? '-'}
                  </p>
                </div>
                <div className='border border-border/70 bg-background p-4'>
                  <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                    Romanization
                  </p>
                  <p className='mt-2 text-lg font-medium'>
                    {kotowaza?.romaji ?? '-'}
                  </p>
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='border border-border/70 bg-background p-4'>
                  <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                    Literal
                  </p>
                  <p className='mt-2 text-sm leading-6 text-foreground/90'>
                    {kotowaza?.literal ?? '-'}
                  </p>
                </div>
                <div className='border border-border/70 bg-background p-4'>
                  <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                    Equivalent
                  </p>
                  <p className='mt-2 text-sm leading-6 text-foreground/90'>
                    {kotowaza?.equivalent?.en ?? '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <aside className='space-y-4'>
          <Card className='border-border bg-card/70 p-4 shadow-none rounded-none'>
            <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
              Quick Facts
            </p>
            <div className='mt-4 space-y-3'>
              <div className='flex items-center justify-between border-b border-border/60 pb-2'>
                <span className='text-sm text-muted-foreground'>JLPT</span>
                <span className='text-sm font-medium'>
                  {kotowaza?.jlpt ?? '-'}
                </span>
              </div>
              <div className='flex items-center justify-between border-b border-border/60 pb-2'>
                <span className='text-sm text-muted-foreground'>Tags</span>
                <span className='text-sm font-medium'>{tags.length}</span>
              </div>
              <div className='flex items-center justify-between border-b border-border/60 pb-2'>
                <span className='text-sm text-muted-foreground'>Examples</span>
                <span className='text-sm font-medium'>{examples.length}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Related</span>
                <span className='text-sm font-medium'>{related.length}</span>
              </div>
            </div>
          </Card>

          <Card className='border-border bg-card/70 p-4 shadow-none rounded-none'>
            <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
              Tags
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className='border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground'
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className='text-sm text-muted-foreground'>
                  No tags yet.
                </span>
              )}
            </div>
          </Card>

          <Card className='border-border bg-card/70 p-4 shadow-none rounded-none'>
            <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
              Example
            </p>
            {examples[0] ? (
              <div className='mt-3 space-y-3 border-l-2 border-foreground/90 pl-4'>
                <p className='text-sm leading-6'>{examples[0].ja}</p>
                <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                  {examples[0].romaji}
                </p>
                {examples[0].en ? (
                  <p className='text-sm text-muted-foreground'>
                    {examples[0].en}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className='mt-3 text-sm text-muted-foreground'>
                No example available.
              </p>
            )}
          </Card>
        </aside>
      </section>
    </main>
  );
}
