import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, PencilLine, RotateCcw, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Heading } from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orpc } from '@/orpc/client';

export const Route = createFileRoute('/kanji_/$letter')({
  loader: async ({ context, params }) => {
    await context.queryClient.fetchQuery(
      orpc.letter.getKanji.queryOptions({
        input: { character: params.letter },
      }),
    );
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
});

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const message =
    error instanceof Error
      ? error.message
      : 'An unexpected problem occurred while loading this kanji detail.';

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <Button asChild variant='outline'>
          <Link to='/kanji'>
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
          Kanji Detail
        </p>
      </div>

      <Card className='overflow-hidden rounded-none border-border bg-card/70 shadow-none'>
        <div className='grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]'>
          <div className='relative flex min-h-[220px] items-center justify-center border-b border-border/70 bg-background p-8 lg:border-b-0 lg:border-r'>
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35' />
            <div className='relative flex size-24 items-center justify-center rounded-full border border-border/70 bg-card text-destructive shadow-sm'>
              <TriangleAlert className='size-10' />
            </div>
          </div>

          <div className='space-y-6 p-6 sm:p-8'>
            <div className='space-y-3'>
              <p className='text-[11px] tracking-[0.24em] text-muted-foreground uppercase'>
                Load Error
              </p>
              <Heading
                level='h1'
                className='text-3xl leading-tight sm:text-4xl'
              >
                We could not load this kanji detail.
              </Heading>
              <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
                The character data or stroke canvas failed to initialize. Try
                again, or return to the kanji index if the problem persists.
              </p>
            </div>

            <div className='rounded-md border border-border/70 bg-background/80 p-4'>
              <p className='text-xs tracking-[0.18em] text-muted-foreground uppercase'>
                Details
              </p>
              <p className='mt-2 text-sm leading-6 text-foreground/90'>
                {message}
              </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row'>
              <Button onClick={reset} className='sm:flex-1'>
                <RotateCcw />
                Try again
              </Button>
              <Button asChild variant='outline' className='sm:flex-1'>
                <Link to='/kanji'>Back to Kanji</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}

function RouteComponent() {
  const { letter } = Route.useParams();
  const { data: kanji } = useSuspenseQuery(
    orpc.kanji.getKanjiDetails.queryOptions({
      input: { character: letter },
    }),
  );
  const {
    data: kotowazaList = [],
    isError: isKotowazaError,
    isPending: isKotowazaPending,
    error: kotowazaError,
  } = useQuery(
    orpc.kanji.getKotowazaByKanji.queryOptions({
      input: { character: letter },
    }),
  );

  const [mode, setMode] = useState<'learn' | 'write'>('learn');
  const [isWriterReady, setIsWriterReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const writerContainerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<{
    animateCharacter: () => unknown;
    loopCharacterAnimation: () => void;
    quiz: (options?: Record<string, unknown>) => void;
    cancelQuiz: () => void;
  } | null>(null);
  const writerSize = 260;
  const meaningList = Array.isArray(kanji.meanings) ? kanji.meanings : [];
  const onReadingList = Array.isArray(kanji.on_readings)
    ? kanji.on_readings
    : [];
  const kunReadingList = Array.isArray(kanji.kun_readings)
    ? kanji.kun_readings
    : [];
  const nameReadingList = Array.isArray(kanji.name_readings)
    ? kanji.name_readings
    : [];
  const primaryMeaning = meaningList[0] ?? '-';
  const meaningText = meaningList.length > 0 ? meaningList.join(', ') : '-';
  const kotowazaMessage =
    kotowazaError instanceof Error
      ? kotowazaError.message
      : 'Kotowaza untuk kanji ini belum tersedia.';

  useEffect(() => {
    let disposed = false;

    async function setupWriter() {
      if (!writerContainerRef.current) {
        return;
      }

      setLoadError(null);
      setIsWriterReady(false);
      writerContainerRef.current.innerHTML = '';

      try {
        const module = await import('hanzi-writer');

        if (disposed || !writerContainerRef.current) {
          return;
        }

        const writer = module.default.create(
          writerContainerRef.current,
          kanji.kanji,
          {
            width: writerSize,
            height: writerSize,
            padding: 20,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 250,
          },
        );

        writerRef.current = writer;
        setIsWriterReady(true);
      } catch {
        setLoadError('Failed to load Hanzi Writer. Please refresh the page.');
      }
    }

    setupWriter();

    return () => {
      disposed = true;
      writerRef.current?.cancelQuiz();
      writerRef.current = null;
    };
  }, [kanji.kanji]);

  useEffect(() => {
    if (!isWriterReady || !writerRef.current) {
      return;
    }

    const writer = writerRef.current;
    writer.cancelQuiz();

    if (mode === 'learn') {
      void writer.animateCharacter();
      writer.loopCharacterAnimation();
      return;
    }

    writer.quiz({
      showHintAfterMisses: 1,
      leniency: 1,
    });
  }, [mode, isWriterReady]);

  const replayAnimation = () => {
    if (!writerRef.current) {
      return;
    }

    writerRef.current.cancelQuiz();
    void writerRef.current.animateCharacter();
  };

  const restartQuiz = () => {
    if (!writerRef.current) {
      return;
    }

    writerRef.current.cancelQuiz();
    writerRef.current.quiz({
      showHintAfterMisses: 1,
      leniency: 1,
    });
  };

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <Button asChild variant='outline'>
          <Link to='/kanji'>
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
          Kanji Detail
        </p>
      </div>

      <section className='grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)_290px]'>
        <Card className='rounded-none border-border bg-card/70 p-3 shadow-none'>
          <div className='relative grid h-[320px] place-items-center overflow-hidden border border-border/60 bg-background'>
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:50%_100%,100%_50%] opacity-70' />
            <p className='relative z-[1] font-sans-jp text-[160px] leading-none'>
              {kanji.kanji}
            </p>
          </div>
          <div className='mt-3 grid grid-cols-2 gap-2 text-xs tracking-[0.14em] text-muted-foreground uppercase'>
            <span className='border border-border/70 px-2 py-1'>
              {kanji.unicode}
            </span>
            <span className='border border-border/70 px-2 py-1 text-right'>
              {kanji.stroke_count} strokes
            </span>
          </div>
        </Card>

        <section className='space-y-4 border-y border-border/70 py-2 lg:px-2'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Character
          </p>
          <h1 className='font-sans-jp text-5xl leading-tight sm:text-6xl'>
            {kanji.kanji}
          </h1>
          <p className='text-3xl leading-tight text-muted-foreground'>
            {primaryMeaning}
          </p>
          <div className='h-px w-24 bg-border' />
          <p className='max-w-2xl text-base leading-7 text-foreground'>
            {meaningText}
          </p>

          <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
            Use learn mode to follow the animated stroke order, then switch to
            write mode to practice the character directly on the canvas.
          </p>
        </section>

        <Card className='rounded-none border-border bg-card/70 p-3 shadow-none'>
          <p className='mb-2 text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Stroke Order
          </p>
          <div className='rounded-md border border-border/70 p-2'>
            <div
              ref={writerContainerRef}
              className='mx-auto flex h-[260px] w-[260px] max-w-full items-center justify-center bg-background'
            />
          </div>

          {loadError ? (
            <p className='mt-3 text-sm text-destructive'>{loadError}</p>
          ) : null}

          {!isWriterReady && !loadError ? (
            <p className='mt-3 text-sm text-muted-foreground'>
              Preparing canvas...
            </p>
          ) : null}

          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as 'learn' | 'write')}
            className='mt-4 gap-3'
          >
            <TabsList className='w-full'>
              <TabsTrigger value='learn'>Learn</TabsTrigger>
              <TabsTrigger value='write'>Write</TabsTrigger>
            </TabsList>

            <TabsContent value='learn' className='mt-0'>
              <Button
                onClick={replayAnimation}
                disabled={!isWriterReady}
                className='w-full'
              >
                <RotateCcw />
                Replay Animation
              </Button>
            </TabsContent>

            <TabsContent value='write' className='mt-0'>
              <Button
                onClick={restartQuiz}
                disabled={!isWriterReady}
                className='w-full'
              >
                <PencilLine />
                Restart Quiz
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </section>

      <section className='space-y-5'>
        <div className='border-b border-border/60 pb-3'>
          <p className='text-[11px] tracking-[0.24em] text-muted-foreground uppercase'>
            Study Deck
          </p>
          <h2 className='mt-1 text-3xl leading-none'>Reading Atlas</h2>
        </div>

        <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
          <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
            <div className='grid gap-4 md:grid-cols-3'>
              <section className='space-y-3 border-l-2 border-foreground/90 pl-4'>
                <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                  Onyomi
                </p>
                <div className='flex flex-wrap gap-2'>
                  {(onReadingList.length > 0 ? onReadingList : ['-']).map(
                    (item) => (
                      <span
                        key={`on-${item}`}
                        className='border border-border/70 bg-foreground px-3 py-1 text-sm text-background'
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </section>

              <section className='space-y-3 border-l-2 border-border/80 pl-4'>
                <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                  Kunyomi
                </p>
                <div className='flex flex-wrap gap-2'>
                  {(kunReadingList.length > 0 ? kunReadingList : ['-']).map(
                    (item) => (
                      <span
                        key={`kun-${item}`}
                        className='border border-border/70 bg-background px-3 py-1 text-sm'
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </section>

              <section className='space-y-3 border-l-2 border-border/80 pl-4'>
                <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                  Nanori
                </p>
                <div className='flex flex-wrap gap-2'>
                  {(nameReadingList.length > 0 ? nameReadingList : ['-']).map(
                    (item) => (
                      <span
                        key={`name-${item}`}
                        className='border border-border/70 bg-background px-3 py-1 text-sm'
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </section>
            </div>
          </Card>

          <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
            <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
              Quick Facts
            </p>
            <div className='mt-4 space-y-3'>
              <div className='flex items-center justify-between border-b border-border/60 pb-2'>
                <span className='text-sm text-muted-foreground'>Joyo</span>
                <span className='text-sm font-medium'>
                  Grade {kanji.grade ?? '-'}
                </span>
              </div>
              <div className='flex items-center justify-between border-b border-border/60 pb-2'>
                <span className='text-sm text-muted-foreground'>JLPT</span>
                <span className='text-sm font-medium'>
                  N{kanji.jlpt ?? '-'}
                </span>
              </div>
              <div className='flex items-center justify-between border-b border-border/60 pb-2'>
                <span className='text-sm text-muted-foreground'>Frequency</span>
                <span className='text-sm font-medium'>
                  #{kanji.freq_mainichi_shinbun ?? '-'}
                </span>
              </div>
              <div className='flex items-center justify-between border-b border-border/60 pb-2'>
                <span className='text-sm text-muted-foreground'>Strokes</span>
                <span className='text-sm font-medium'>
                  {kanji.stroke_count ?? '-'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Unicode</span>
                <span className='text-sm font-medium'>
                  {kanji.unicode ?? '-'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
          <p className='text-xs tracking-[0.2em] uppercase'>Reading Notes</p>
          <div className='mt-3 grid gap-3 md:grid-cols-3'>
            <div className='border border-border/70 bg-background p-3'>
              <Heading level='h6' className='text-sm font-semibold'>
                Onyomi (音読み)
              </Heading>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                Sino-Japanese reading derived from historical Chinese
                pronunciation, often used in kanji compounds (jukugo).
              </p>
            </div>

            <div className='border border-border/70 bg-background p-3'>
              <Heading level='h6' className='text-sm font-semibold'>
                Kunyomi (訓読み)
              </Heading>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                Native Japanese reading, commonly used when a kanji stands alone
                or appears with okurigana.
              </p>
            </div>

            <div className='border border-border/70 bg-background p-3'>
              <Heading level='h6' className='text-sm font-semibold'>
                Nanori (名乗り)
              </Heading>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                Special name reading used in personal or place names. Not every
                kanji has a nanori reading.
              </p>
            </div>
          </div>
        </Card>

        <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
          <div className='flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
                Kotowaza
              </p>
              <h2 className='mt-1 text-3xl leading-none'>Related Proverbs</h2>
            </div>
            <p className='text-sm text-muted-foreground'>
              {isKotowazaPending
                ? 'Loading kotowaza...'
                : `${kotowazaList.length} result${kotowazaList.length === 1 ? '' : 's'}`}
            </p>
          </div>

          {isKotowazaError ? (
            <div className='mt-4 border border-border/70 bg-background p-4 text-sm text-muted-foreground'>
              {kotowazaMessage}
            </div>
          ) : kotowazaList.length > 0 ? (
            <div className='mt-4 grid gap-4 lg:grid-cols-2'>
              {kotowazaList.map((item) => (
                <article
                  key={item.id}
                  className='border border-border/70 bg-background p-4'
                >
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div>
                      <p className='font-sans-jp text-2xl leading-none'>
                        {item.japanese}
                      </p>
                      <p className='mt-2 text-sm tracking-[0.12em] text-muted-foreground uppercase'>
                        {item.romaji}
                      </p>
                    </div>
                    {item.jlpt ? (
                      <span className='border border-border/70 px-2 py-1 text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                        {item.jlpt}
                      </span>
                    ) : null}
                  </div>

                  <p className='mt-4 text-sm leading-6 text-foreground/90'>
                    {item.meaning?.en ?? item.literal}
                  </p>

                  <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                    <div className='space-y-1 border-l-2 border-foreground/90 pl-3'>
                      <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                        Reading
                      </p>
                      <p className='text-sm'>{item.reading}</p>
                    </div>
                    <div className='space-y-1 border-l-2 border-border/80 pl-3'>
                      <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                        Literal
                      </p>
                      <p className='text-sm'>{item.literal}</p>
                    </div>
                  </div>

                  {item.examples?.[0] ? (
                    <div className='mt-4 border-t border-border/60 pt-3'>
                      <p className='text-xs tracking-[0.16em] text-muted-foreground uppercase'>
                        Example
                      </p>
                      <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                        {item.examples[0].ja}
                      </p>
                    </div>
                  ) : null}

                  {item.tags?.length ? (
                    <div className='mt-4 flex flex-wrap gap-2'>
                      {item.tags.map((tag) => (
                        <span
                          key={`${item.id}-${tag}`}
                          className='border border-border/70 bg-card px-2 py-1 text-xs text-muted-foreground'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className='mt-4 border border-dashed border-border/70 bg-background p-4 text-sm text-muted-foreground'>
              No kotowaza found for this kanji.
            </div>
          )}
        </Card>

        <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Practice Guide
          </p>
          <div className='mt-3 grid gap-3 md:grid-cols-3'>
            <div className='border border-border/70 bg-background p-3'>
              <p className='text-xs text-muted-foreground'>Step 1</p>
              <p className='mt-1 text-sm font-medium'>Watch stroke animation</p>
            </div>
            <div className='border border-border/70 bg-background p-3'>
              <p className='text-xs text-muted-foreground'>Step 2</p>
              <p className='mt-1 text-sm font-medium'>Switch to write mode</p>
            </div>
            <div className='border border-border/70 bg-background p-3'>
              <p className='text-xs text-muted-foreground'>Step 3</p>
              <p className='mt-1 text-sm font-medium'>Repeat until confident</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
