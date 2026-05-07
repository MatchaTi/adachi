import { createFileRoute, Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  useWritingProgressStore,
  type WritingCharacterType,
} from '@/store/writing-progress';

export const Route = createFileRoute('/character-mastery')({
  component: RouteComponent,
});

const MASTERY_TARGET = 100;

type MasteryItem = {
  character: string;
  count: number;
  progress: number;
  isMastered: boolean;
};

type MasterySection = {
  type: WritingCharacterType;
  title: string;
  subtitle: string;
  items: MasteryItem[];
};

const SECTION_META: Record<
  WritingCharacterType,
  Pick<MasterySection, 'title' | 'subtitle'>
> = {
  hiragana: {
    title: 'Hiragana',
    subtitle: 'Native Japanese phonetic characters',
  },
  katakana: {
    title: 'Katakana',
    subtitle: 'Angular characters for loanwords and emphasis',
  },
  kanji: {
    title: 'Kanji',
    subtitle: 'Logographic characters practiced through stroke order',
  },
};

const getMasterySections = (
  completedCharacters: Record<string, number>,
): MasterySection[] => {
  const sections: Record<WritingCharacterType, MasteryItem[]> = {
    hiragana: [],
    katakana: [],
    kanji: [],
  };

  for (const [key, count] of Object.entries(completedCharacters)) {
    const [type, character] = key.split(':');

    if (!isWritingCharacterType(type) || !character) {
      continue;
    }

    sections[type].push({
      character,
      count,
      progress: Math.min((count / MASTERY_TARGET) * 100, 100),
      isMastered: count >= MASTERY_TARGET,
    });
  }

  return (Object.keys(sections) as WritingCharacterType[]).map((type) => ({
    type,
    ...SECTION_META[type],
    items: sections[type].sort((a, b) => b.count - a.count),
  }));
};

const isWritingCharacterType = (
  value: string | undefined,
): value is WritingCharacterType =>
  value === 'hiragana' || value === 'katakana' || value === 'kanji';

function RouteComponent() {
  const completedCharacters = useWritingProgressStore(
    (state) => state.completedCharacters,
  );
  const sections = getMasterySections(completedCharacters);
  const totalPracticed = sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  const totalMastered = sections.reduce(
    (total, section) =>
      total + section.items.filter((item) => item.isMastered).length,
    0,
  );

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8'>
      <section className='flex flex-col gap-3 border-b border-border/70 pb-6'>
        <p className='text-xs tracking-[0.24em] text-muted-foreground uppercase'>
          Progress Tracking
        </p>
        <h1 className='text-4xl leading-tight sm:text-5xl'>
          Character Mastery
        </h1>
        <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
          Track mastery for every character you have practiced. A character is
          considered mastered after 100 completed writing attempts.
        </p>
      </section>

      <section className='grid gap-4 sm:grid-cols-2'>
        <Card className='rounded-none border-border bg-card/70 shadow-none'>
          <CardHeader>
            <CardDescription>Practiced Characters</CardDescription>
            <CardTitle className='text-4xl'>{totalPracticed}</CardTitle>
          </CardHeader>
        </Card>

        <Card className='rounded-none border-border bg-card/70 shadow-none'>
          <CardHeader>
            <CardDescription>Mastered Characters</CardDescription>
            <CardTitle className='text-4xl'>{totalMastered}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className='flex flex-col gap-6'>
        {sections.map((section) => (
          <MasterySectionCard key={section.type} section={section} />
        ))}
      </section>
    </main>
  );
}

function MasterySectionCard({ section }: { section: MasterySection }) {
  const masteredCount = section.items.filter((item) => item.isMastered).length;
  return (
    <Card className='rounded-none border-border bg-card/70 shadow-none'>
      <CardHeader>
        <div className='flex flex-col gap-2'>
          <CardTitle>{section.title}</CardTitle>
          <CardDescription>{section.subtitle}</CardDescription>
        </div>
        <CardAction>
          <Badge variant='secondary'>
            {masteredCount}/{section.items.length} mastered
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        {section.items.length > 0 ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {section.items.map((item) => (
              <CharacterMasteryCard
                key={item.character}
                item={item}
                type={section.type}
              />
            ))}
          </div>
        ) : (
          <div className='rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground'>
            No practiced {section.title.toLowerCase()} characters yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CharacterMasteryCard({
  item,
  type,
}: {
  item: MasteryItem;
  type: WritingCharacterType;
}) {
  const detailPath = `/${type}/$letter` as const;

  return (
    <Link to={detailPath} params={{ letter: item.character }}>
      <Card className='aspect-square rounded-none border-border bg-background p-3 shadow-none transition-colors hover:bg-muted/50'>
        <CardContent className='flex h-full flex-col justify-between gap-3 p-0'>
          <div className='flex items-start justify-between gap-2'>
            <Badge variant={item.isMastered ? 'default' : 'outline'}>
              {item.isMastered ? 'Mastered' : `${Math.round(item.progress)}%`}
            </Badge>
            <span className='text-xs text-muted-foreground'>
              {item.count}/{MASTERY_TARGET}
            </span>
          </div>

          <div className='flex flex-1 items-center justify-center font-sans-jp text-6xl leading-none sm:text-7xl'>
            {item.character}
          </div>

          <Progress value={item.progress} />
        </CardContent>
      </Card>
    </Link>
  );
}
