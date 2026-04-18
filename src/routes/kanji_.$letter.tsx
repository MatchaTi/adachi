import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
  const { letter } = Route.useParams();
  const { data: kanji } = useSuspenseQuery(
    orpc.letter.getKanji.queryOptions({
      input: { character: letter },
    }),
  );

  const unicodeCodepoint = `U+${kanji.character.codePointAt(0)?.toString(16).toUpperCase()}`;

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8'>
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
            <p className='font-sans-jp text-[160px] leading-none'>
              {kanji.character}
            </p>
          </div>
          <div className='mt-3 grid grid-cols-2 gap-2 text-xs tracking-[0.14em] text-muted-foreground uppercase'>
            <span className='border border-border/70 px-2 py-1'>
              {unicodeCodepoint}
            </span>
            <span className='border border-border/70 px-2 py-1 text-right'>
              {kanji.strokes} strokes
            </span>
          </div>
        </Card>

        <section className='space-y-4 border-y border-border/70 py-2 lg:px-2'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Meaning
          </p>
          <h1 className='font-sans-jp text-5xl leading-tight sm:text-6xl'>
            {kanji.character}
          </h1>
          <p className='text-4xl leading-tight capitalize'>{kanji.meaning}</p>
          <div className='h-px w-24 bg-border' />
          <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
            Review this kanji with both readings. Use{' '}
            <span className='font-medium text-foreground'>on&apos;yomi</span>{' '}
            for Chinese-derived pronunciation patterns and{' '}
            <span className='font-medium text-foreground'>kun&apos;yomi</span>{' '}
            for native Japanese readings.
          </p>
        </section>

        <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
          <p className='mb-3 text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Readings
          </p>
          <div className='space-y-3 text-sm'>
            <div className='border border-border/70 p-3'>
              <p className='text-xs text-muted-foreground uppercase tracking-wider'>
                On&apos;yomi
              </p>
              <p className='mt-1'>{kanji.onyomi}</p>
            </div>
            <div className='border border-border/70 p-3'>
              <p className='text-xs text-muted-foreground uppercase tracking-wider'>
                Kun&apos;yomi
              </p>
              <p className='mt-1'>{kanji.kunyomi}</p>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div className='border border-border/70 p-3'>
                <p className='text-xs text-muted-foreground uppercase tracking-wider'>
                  JLPT
                </p>
                <p className='mt-1'>{kanji.jlpt}</p>
              </div>
              <div className='border border-border/70 p-3'>
                <p className='text-xs text-muted-foreground uppercase tracking-wider'>
                  Grade
                </p>
                <p className='mt-1'>{kanji.grade}</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
