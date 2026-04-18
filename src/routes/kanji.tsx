import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import Hero from '@/components/shared/hero';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { client } from '@/orpc/client';

export const Route = createFileRoute('/kanji')({
  component: RouteComponent,
  errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
  const [search, setSearch] = useState('');
  const normalizedQuery = search.trim().toLowerCase();
  const [query] = useDebounce(normalizedQuery, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ['kanji', 'infinite', query],
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        client.letter.getKanjiPage({
          cursor: pageParam,
          limit: 40,
          search: query,
        }),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const description =
    'Kanji and related components can be complex, but writing practice helps build recognition quickly. Browse the character set and open any item to study animated stroke order and practice drawing directly on the canvas.';

  const kanjiList = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (!first?.isIntersecting || !hasNextPage || isFetchingNextPage) {
          return;
        }

        void fetchNextPage();
      },
      {
        rootMargin: '200px',
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <main>
      <Hero badge='漢字' heading='Kanji' description={description}>
        <div className='relative max-w-md'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search kanji...'
            className='pl-9'
            aria-label='Search kanji'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </Hero>

      <section className='grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {kanjiList.map((char) => (
          <Link
            to='/kanji/$letter'
            params={{ letter: char.character }}
            key={char.character}
          >
            <Card className='rounded-none border-border shadow-none sm:aspect-square'>
              <CardHeader>
                <CardTitle className='text-[5vh]'>{char.character}</CardTitle>
                <CardDescription>{char.romaji || '-'}</CardDescription>
                <p className='line-clamp-2 text-xs text-muted-foreground'>
                  {char.arti || '-'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {char.strokes.length} strokes
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      {isLoading ? (
        <section className='border-t border-border/70 px-4 py-8'>
          <p className='text-sm text-muted-foreground'>Loading kanji...</p>
        </section>
      ) : null}

      {!isLoading && kanjiList.length === 0 ? (
        <section className='border-t border-border/70 px-4 py-8'>
          <p className='text-sm text-muted-foreground'>No kanji found.</p>
        </section>
      ) : null}

      {kanjiList.length > 0 ? (
        <section className='border-t border-border/70 px-4 py-6'>
          <div ref={loadMoreRef} className='h-6' />
          {isFetchingNextPage ? (
            <p className='text-center text-sm text-muted-foreground'>
              Loading more...
            </p>
          ) : null}
          {!hasNextPage && !isLoading ? (
            <p className='text-center text-xs text-muted-foreground'>
              You have reached the end.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
