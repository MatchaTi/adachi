import { useSuspenseQuery } from '@tanstack/react-query';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, PencilLine, RotateCcw, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Heading } from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orpc } from '@/orpc/client';

export const Route = createFileRoute('/hiragana_/$letter')({
  head: ({ params }) => ({
    meta: [
      { title: `Hiragana ${params.letter} - Adachi` },
      {
        name: 'description',
        content: `Learn to write and read Hiragana ${params.letter} with interactive stroke order practice and detailed guides.`,
      },
    ],
  }),
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.fetchQuery(
      orpc.letter.getHiragana.queryOptions({
        input: { character: params.letter },
      }),
    );
  },
  errorComponent: ErrorComponent,
});

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const message =
    error instanceof Error
      ? error.message
      : 'An unexpected problem occurred while loading this hiragana detail.';

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <Button asChild variant='outline'>
          <Link to='/hiragana'>
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
          Hiragana Detail
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
                We could not load this hiragana detail.
              </Heading>
              <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
                The character data or stroke canvas failed to initialize. Try
                again, or return to the hiragana index if the problem persists.
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
                <Link to='/hiragana'>Back to Hiragana</Link>
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
  const { data: hiragana } = useSuspenseQuery(
    orpc.letter.getHiragana.queryOptions({
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
          hiragana.character,
          {
            width: writerSize,
            height: writerSize,
            padding: 20,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 250,
            charDataLoader: () => ({
              strokes: hiragana.strokes,
              medians: hiragana.medians,
            }),
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
  }, [hiragana.character, hiragana.medians, hiragana.strokes]);

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

  const strokeCount = hiragana.strokes.length;
  const unicodeCodepoint = `U+${hiragana.character
    .codePointAt(0)
    ?.toString(16)
    .toUpperCase()}`;

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <Button asChild variant='outline'>
          <Link to='/hiragana'>
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
          Hiragana Detail
        </p>
      </div>

      <section className='grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)_290px]'>
        <Card className='border-border bg-card/70 p-3 shadow-none rounded-none'>
          <div className='relative grid h-[320px] place-items-center overflow-hidden border border-border/60 bg-background'>
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:50%_100%,100%_50%] opacity-70' />
            <p className='relative z-[1] font-sans-jp text-[160px] leading-none'>
              {hiragana.character}
            </p>
          </div>
          <div className='mt-3 grid grid-cols-2 gap-2 text-xs tracking-[0.14em] text-muted-foreground uppercase'>
            <span className='border border-border/70 px-2 py-1'>
              {unicodeCodepoint}
            </span>
            <span className='border border-border/70 px-2 py-1 text-right'>
              {strokeCount} strokes
            </span>
          </div>
        </Card>

        <section className='space-y-4 border-y border-border/70 py-2 lg:px-2'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Meaning
          </p>
          <h1 className='font-sans-jp text-5xl leading-tight sm:text-6xl'>
            {hiragana.character}
          </h1>
          <p className='text-4xl leading-tight'>{hiragana.romaji}</p>
          <div className='h-px w-24 bg-border' />
          <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
            This hiragana character is read as{' '}
            <span className='font-medium text-foreground'>
              {hiragana.romaji}
            </span>
            . Use learn mode to follow the animated stroke order, then switch to
            write mode to practice writing directly on the canvas.
          </p>
        </section>

        <Card className='border-border bg-card/70 p-3 shadow-none rounded-none'>
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
    </main>
  );
}
