import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, PencilLine, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orpc } from '@/orpc/client';

export const Route = createFileRoute('/katakana_/$letter')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.fetchQuery(
      orpc.letter.getKatakana.queryOptions({
        input: { character: params.letter },
      }),
    );
  },
  errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
  const { letter } = Route.useParams();
  const { data: katakana } = useSuspenseQuery(
    orpc.letter.getKatakana.queryOptions({
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
          katakana.character,
          {
            width: writerSize,
            height: writerSize,
            padding: 20,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 250,
            charDataLoader: () => ({
              strokes: katakana.strokes,
              medians: katakana.medians,
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
  }, [katakana.character, katakana.medians, katakana.strokes]);

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

  const strokeCount = katakana.strokes.length;
  const unicodeCodepoint = `U+${katakana.character
    .codePointAt(0)
    ?.toString(16)
    .toUpperCase()}`;

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8'>
      <div className='flex items-center justify-between'>
        <Button asChild variant='outline'>
          <Link to='/katakana'>
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
          Katakana Detail
        </p>
      </div>

      <section className='grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)_290px]'>
        <Card className='border-border bg-card/70 p-3 shadow-none rounded-none'>
          <div className='relative grid h-[320px] place-items-center overflow-hidden border border-border/60 bg-background'>
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:50%_100%,100%_50%] opacity-70' />
            <p className='font-sans-jp text-[160px] leading-none'>
              {katakana.character}
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
            {katakana.character}
          </h1>
          <p className='text-4xl leading-tight'>{katakana.romaji}</p>
          <div className='h-px w-24 bg-border' />
          <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
            This katakana character is read as{' '}
            <span className='font-medium text-foreground'>
              {katakana.romaji}
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
