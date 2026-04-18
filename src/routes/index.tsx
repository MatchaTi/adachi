import { createFileRoute, Link } from '@tanstack/react-router';
import { Languages, NotebookPen } from 'lucide-react';
import Footer from '@/components/Footer';
import Hero from '@/components/shared/hero';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PROJECT_NAME, PROJECT_NAME_HIRAGANA } from '@/infra/lib/constants';

export const Route = createFileRoute('/')({ component: App });

const FEATURE_ITEMS = [
  {
    title: 'Hiragana, Katakana & Kanji',
    description:
      'Build a strong foundation across the three Japanese writing systems',
    icon: Languages,
  },
  {
    title: 'Interactive Writing Practice',
    description:
      'Learn to write Japanese characters with hanzi-writer and real-time stroke order feedback',
    icon: NotebookPen,
  },
];

function App() {
  const description =
    'Platform for learning how to write and read Japanese characters, including Hiragana, Katakana, and Kanji.';

  return (
    <main className='space-y-24'>
      <Hero
        badge={PROJECT_NAME_HIRAGANA}
        heading={PROJECT_NAME}
        description={description}
      >
        <div className='space-x-4'>
          <Button asChild>
            <Link to='/hiragana'>あ Hiragana</Link>
          </Button>
          <Button asChild>
            <Link to='/katakana'>ア Katakana</Link>
          </Button>
          <Button asChild>
            <Link to='/kanji'>漢 Kanji</Link>
          </Button>
        </div>
      </Hero>

      <section className='grid md:grid-cols-2'>
        {FEATURE_ITEMS.map((item) => (
          <Card
            key={item.title}
            className='shadow-none border-border rounded-none'
          >
            <CardHeader>
              <div className='w-10 h-10 bg-muted flex items-center justify-center'>
                <item.icon />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section>
        <img
          src='/hougetsu.png'
          alt='Hougetsu wangy-wangy'
          className='mx-auto dark:invert'
        />
      </section>

      <Footer />
    </main>
  );
}
