import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/shared/hero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { buildSeoHead } from '@/lib/seo';

export const Route = createFileRoute('/joyo')({
  head: () =>
    buildSeoHead({
      title: 'Joyo Kanji - Adachi',
      description:
        'Study Joyo kanji organized by school grade from Grade 1 to Grade 6 in a structured learning path.',
      path: '/joyo',
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const description =
    'Explore kanji sets organized by Joyo grade, from Grade 1 to Grade 6. Each set groups the official school-grade kanji into a focused study path so you can move from the simplest set to the most advanced one.';

  const joyoLevels = [
    {
      grade: 1,
      title: 'Foundational Basics',
      summary:
        'The first set of school-grade kanji, centered on everyday objects, numbers, and core language building blocks.',
    },
    {
      grade: 2,
      title: 'Primary Expansion',
      summary:
        'Common kanji used in short sentences, classroom language, and simple reading material.',
    },
    {
      grade: 3,
      title: 'Intermediate School Use',
      summary:
        'Broader kanji coverage for routine reading, schoolwork, and everyday written Japanese.',
    },
    {
      grade: 4,
      title: 'Upper Primary Growth',
      summary:
        'Kanji that appear in more varied contexts and strengthen recognition of common written forms.',
    },
    {
      grade: 5,
      title: 'Pre-advanced Reading',
      summary:
        'Important kanji for more complex articles, formal instructions, and expanded vocabulary.',
    },
    {
      grade: 6,
      title: 'Upper-grade Mastery',
      summary:
        'The final school-grade set, covering advanced everyday literacy and more nuanced reading.',
    },
  ];

  return (
    <main>
      <Hero badge='常用漢字' heading='Joyo kanji' description={description} />

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {joyoLevels.map((item) => (
          <Card
            key={item.grade}
            className='group relative overflow-hidden rounded-none border-border bg-card/70 p-5 shadow-none'
          >
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-0 transition-opacity duration-200 group-hover:opacity-35' />

            <div className='relative flex h-full flex-col gap-4'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-[11px] tracking-[0.2em] text-muted-foreground uppercase'>
                    Grade {item.grade}
                  </p>
                  <h2 className='mt-1 text-2xl leading-none'>
                    Joyo {item.grade}
                  </h2>
                </div>
                <span className='rounded-full border border-border/70 px-2.5 py-1 text-[10px] tracking-[0.18em] text-muted-foreground uppercase'>
                  Grade
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
                  <Link
                    to='/joyo/$grade'
                    params={{ grade: String(item.grade) }}
                  >
                    Open Grade {item.grade}
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
