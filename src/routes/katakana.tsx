import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import Hero from '@/components/shared/hero';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { orpc } from '@/orpc/client';

export const Route = createFileRoute('/katakana')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.fetchQuery(
      orpc.letter.getAllKatakana.queryOptions(),
    );
  },
  errorComponent: () => <div>Error Euy</div>,
});

function RouteComponent() {
  const { data: katakana } = useSuspenseQuery(
    orpc.letter.getAllKatakana.queryOptions(),
  );

  const description =
    'Primarily used for foreign loanwords, onomatopoeia, and emphasis, Katakana is one of the three Japanese writing systems. It has 46 core characters mirroring Hiragana sounds with a sharper, angular style. Katakana commonly appears in modern Japanese writing for names, technical terms, and borrowed vocabulary from other languages.';

  return (
    <main>
      <Hero badge='カタカナ' heading='Katakana' description={description} />

      <section className='grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {katakana.map((char) => (
          <Link
            to='/katakana/$letter'
            params={{ letter: char.character }}
            key={char.character}
          >
            <Card className='rounded-none border-border shadow-none sm:aspect-square'>
              <CardHeader>
                <CardTitle className='text-[5vh]'>{char.character}</CardTitle>
                <CardDescription>{char.romaji}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
