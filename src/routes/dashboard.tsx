import { createFileRoute } from '@tanstack/react-router';
import type { Activity } from '@/components/kibo-ui/contribution-graph';
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from '@/components/kibo-ui/contribution-graph';
import { Card } from '@/components/ui/card';
import { useWritingProgressStore } from '@/store/writing-progress';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
});

const getLocalDateKey = (date = new Date()) => {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getWritingLevel = (count: number) => {
  if (count >= 10) {
    return 4;
  }

  if (count >= 6) {
    return 3;
  }

  if (count >= 3) {
    return 2;
  }

  if (count >= 1) {
    return 1;
  }

  return 0;
};

const buildWritingActivities = (
  dailyProgress: Record<string, number>,
): Activity[] => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 364);

  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    const dateKey = getLocalDateKey(date);
    const count = dailyProgress[dateKey] ?? 0;

    return {
      date: dateKey,
      count,
      level: getWritingLevel(count),
    };
  });
};

function RouteComponent() {
  const dailyProgress = useWritingProgressStore((state) => state.dailyProgress);
  const totalWritingPoints = useWritingProgressStore((state) =>
    state.getTotalWritingPoints(),
  );
  const currentDayStreak = useWritingProgressStore((state) =>
    state.getCurrentDayStreak(),
  );
  const activities = buildWritingActivities(dailyProgress);
  const todayCount = dailyProgress[getLocalDateKey()] ?? 0;

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8'>
      <section className='space-y-3 border-b border-border/70 pb-6'>
        <p className='text-xs tracking-[0.24em] text-muted-foreground uppercase'>
          Dashboard
        </p>
        <h1 className='text-4xl leading-tight sm:text-5xl'>Writing Progress</h1>
        <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
          Track your consistency while practicing Hiragana, Katakana, and Kanji
          writing. Every completed writing quiz adds 1 point to that day.
        </p>
      </section>

      <section className='grid gap-4 sm:grid-cols-3'>
        <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Today
          </p>
          <p className='mt-3 text-4xl leading-none'>{todayCount}</p>
          <p className='mt-2 text-sm text-muted-foreground'>writing points</p>
        </Card>

        <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Current Streak
          </p>
          <p className='mt-3 text-4xl leading-none'>{currentDayStreak}</p>
          <p className='mt-2 text-sm text-muted-foreground'>days in a row</p>
        </Card>

        <Card className='rounded-none border-border bg-card/70 p-4 shadow-none'>
          <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
            Total
          </p>
          <p className='mt-3 text-4xl leading-none'>{totalWritingPoints}</p>
          <p className='mt-2 text-sm text-muted-foreground'>saved points</p>
        </Card>
      </section>

      <Card className='rounded-none border-border bg-card/70 p-4 shadow-none sm:p-6'>
        <div className='mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs tracking-[0.2em] text-muted-foreground uppercase'>
              Daily Writing
            </p>
            <h2 className='mt-1 text-2xl leading-none'>Contribution Graph</h2>
          </div>
          <p className='text-sm text-muted-foreground'>Last 365 days</p>
        </div>

        <ContributionGraph
          data={activities}
          labels={{
            totalCount: '{{count}} writing points in {{year}}',
            legend: { less: 'Less', more: 'More' },
          }}
        >
          <ContributionGraphCalendar>
            {({ activity, dayIndex, weekIndex }) => (
              <ContributionGraphBlock
                activity={activity}
                dayIndex={dayIndex}
                weekIndex={weekIndex}
              />
            )}
          </ContributionGraphCalendar>
          <ContributionGraphFooter>
            <ContributionGraphTotalCount />
            <ContributionGraphLegend />
          </ContributionGraphFooter>
        </ContributionGraph>
      </Card>
    </main>
  );
}
