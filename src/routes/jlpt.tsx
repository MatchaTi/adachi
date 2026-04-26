import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/shared/hero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const Route = createFileRoute('/jlpt')({
  component: RouteComponent,
});

function RouteComponent() {
  const description =
    'Explore kanji sets organized by JLPT level, from N5 to N1. Each set includes essential kanji characters, their readings, meanings, and example words to help you prepare for the JLPT exams.';

  const jlptLevels = [
    {
      level: 5,
      title: 'Starter Foundation',
      summary:
        'Basic everyday kanji used in greetings, numbers, time, and simple daily expressions.',
    },
    {
      level: 4,
      title: 'Elementary Expansion',
      summary:
        'Common kanji for short texts, routine instructions, and practical beginner reading.',
    },
    {
      level: 3,
      title: 'Intermediate Bridge',
      summary:
        'Build fluency with more varied kanji appearing in news snippets and conversational topics.',
    },
    {
      level: 2,
      title: 'Advanced Reading',
      summary:
        'Higher-frequency kanji for opinion pieces, formal writing, and nuanced written materials.',
    },
    {
      level: 1,
      title: 'Near-native Depth',
      summary:
        'Dense kanji coverage for academic and professional Japanese with subtle contextual usage.',
    },
  ];

  return (
    <main>
      <Hero
        badge='日本語能力試験'
        heading='JLPT kanji'
        description={description}
      />

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {jlptLevels.map((item) => (
          <Card
            key={item.level}
            className='group relative overflow-hidden rounded-none border-border bg-card/70 p-5 shadow-none'
          >
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-0 transition-opacity duration-200 group-hover:opacity-35' />

            <div className='relative flex h-full flex-col gap-4'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-[11px] tracking-[0.2em] text-muted-foreground uppercase'>
                    JLPT N{item.level}
                  </p>
                  <h2 className='mt-1 text-2xl leading-none'>N{item.level}</h2>
                </div>
                <span className='rounded-full border border-border/70 px-2.5 py-1 text-[10px] tracking-[0.18em] text-muted-foreground uppercase'>
                  Level
                </span>
              </div>

              <div>
                <p className='text-base font-medium leading-tight'>
                  {item.title}
                </p>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  {item.summary}
                </p>
              </div>

              <div className='mt-auto pt-1'>
                <Button asChild variant='outline' className='w-full'>
                  <Link to='/jlpt/$n' params={{ n: String(item.level) }}>
                    Open JLPT N{item.level}
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
