import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Book,
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
    title: 'JLPT Kanji Sets',
    description:
      'Study essential kanji organized by JLPT level, from N5 to N1, with readings and examples',
    icon: Book,
  },
  {
    title: 'Joyo Grade Path',
    description:
      'Study the official school-grade kanji sequence from Grade 1 through Grade 6 in a structured path',
    icon: Book,
  },
  {
    title: 'Sentence Analysis',
    description:
      'Break down Japanese sentences into tokens, readings, script types, and parts of speech',
    icon: MessageSquareText,
  },
  {
    title: 'Kotowaza',
    description:
      'Explore a curated collection of Japanese proverbs with meanings, equivalents, and examples',
    icon: Book,
  },
];

const NAV_ITEMS = [
  { label: 'あ Hiragana', to: '/hiragana' },
  { label: 'ア Katakana', to: '/katakana' },
  { label: '漢 Kanji', to: '/kanji' },
  { label: '常 Joyo', to: '/joyo' },
  { label: 'ことわざ Kotowaza', to: '/kotowaza' },
  { label: 'JLPT Kanji', to: '/jlpt' },
  { label: '解析 Analyze', to: '/analyze' },
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
          {NAV_ITEMS.map((item) => (
            <Button asChild key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </Hero>

      <section className='grid gap-4 md:grid-cols-2'>
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
