import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Languages,
  Layers,
  MessageSquareText,
  NotebookPen,
} from 'lucide-react';
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
  {
    title: 'Flashcard Drills',
    description:
      'Flip random cards for Hiragana, Katakana, and Kanji to train reading recall quickly',
    icon: Layers,
  },
  {
    title: 'Sentence Analysis',
    description:
      'Break down Japanese sentences into tokens, readings, script types, and parts of speech',
    icon: MessageSquareText,
  },
];

function App() {
  const description =
    'Learn Japanese scripts with searchable character grids, writing practice, flashcard drills, and sentence analysis.';

  return (
    <main className='space-y-24'>
      <Hero
        badge={PROJECT_NAME_HIRAGANA}
        heading={PROJECT_NAME}
        description={description}
      >
        <div className='flex items-center flex-wrap gap-2'>
          <Button asChild>
            <Link to='/hiragana'>あ Hiragana</Link>
          </Button>
          <Button asChild>
            <Link to='/katakana'>ア Katakana</Link>
          </Button>
          <Button asChild>
            <Link to='/kanji'>漢 Kanji</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link to='/analyze'>解析 Analyze</Link>
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
              <div className='bg-muted flex items-center justify-center p-4 w-fit rounded'>
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
    </main>
  );
}
