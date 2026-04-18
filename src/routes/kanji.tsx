import { createFileRoute, Link } from '@tanstack/react-router';
import Hero from '@/components/shared/hero';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { kanjiList } from '@/lib/kanji';

export const Route = createFileRoute('/kanji')({
  component: RouteComponent,
});

function RouteComponent() {
  const description =
    'Kanji are logographic characters used in Japanese writing to express core meanings in words. Start with common beginner kanji and open each detail page to review readings and essential metadata in a focused layout.';

  return (
    <main>
      <Hero badge='漢字' heading='Kanji' description={description} />

      <section className='grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {kanjiList.map((kanji) => (
          <Link
            to='/kanji/$letter'
            params={{ letter: kanji.character }}
            key={kanji.character}
          >
            <Card className='rounded-none border-border shadow-none sm:aspect-square'>
              <CardHeader>
                <CardTitle className='text-[5vh]'>{kanji.character}</CardTitle>
                <CardDescription>{kanji.meaning}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
