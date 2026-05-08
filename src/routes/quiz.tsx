import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Check, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Hero from '@/components/shared/hero';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { buildSeoHead } from '@/lib/seo';
import { orpc } from '@/orpc/client';
import { useWritingProgressStore } from '@/store/writing-progress';

export const Route = createFileRoute('/quiz')({
  head: () =>
    buildSeoHead({
      title: 'Quiz - Adachi',
      description:
        'Practice Hiragana, Katakana, JLPT kanji, and Joyo kanji with multiple-choice quizzes that track your progress.',
      path: '/quiz',
    }),
  component: RouteComponent,
  pendingComponent: RoutePending,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.fetchQuery(orpc.letter.getAllHiragana.queryOptions()),
      context.queryClient.fetchQuery(orpc.letter.getAllKatakana.queryOptions()),
    ]);
  },
});

type QuizSource =
  | 'hiragana'
  | 'katakana'
  | 'jlpt-1'
  | 'jlpt-2'
  | 'jlpt-3'
  | 'jlpt-4'
  | 'jlpt-5'
  | 'joyo-1'
  | 'joyo-2'
  | 'joyo-3'
  | 'joyo-4'
  | 'joyo-5'
  | 'joyo-6';

type KanaPrompt = 'reading' | 'character';
type KanjiPrompt = 'meaning' | 'on' | 'kun' | 'character';
type AnswerMode = 'choice' | 'input';
type AnswerState = 'correct' | 'incorrect' | null;

const KANA_PROMPTS: Record<KanaPrompt, string> = {
  reading: 'Reading',
  character: 'Character',
};

const KANJI_PROMPTS: Record<KanjiPrompt, string> = {
  meaning: 'Meaning',
  on: 'ON reading',
  kun: 'KUN reading',
  character: 'Character',
};

const getSourceType = (source: QuizSource) => {
  if (source === 'hiragana' || source === 'katakana') {
    return source;
  }

  return 'kanji';
};

const getSourceLabel = (source: QuizSource) => {
  if (source === 'hiragana') {
    return 'Hiragana';
  }

  if (source === 'katakana') {
    return 'Katakana';
  }

  if (source.startsWith('jlpt-')) {
    return `JLPT N${source.replace('jlpt-', '')}`;
  }

  return `Joyo Grade ${source.replace('joyo-', '')}`;
};

const pickRandomIndex = (length: number, currentIndex: number) => {
  if (length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * length);

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }

  return nextIndex;
};

const getOptionIndexes = (length: number, answerIndex: number) => {
  const indexes = new Set<number>([answerIndex]);

  while (indexes.size < Math.min(4, length)) {
    indexes.add(Math.floor(Math.random() * length));
  }

  return Array.from(indexes).sort(() => Math.random() - 0.5);
};

function RoutePending() {
  return (
    <main className='px-4 py-10'>
      <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
        <Spinner className='size-4' />
        Loading quiz...
      </div>
    </main>
  );
}

function RouteComponent() {
  const { data: hiragana } = useSuspenseQuery(
    orpc.letter.getAllHiragana.queryOptions(),
  );
  const { data: katakana } = useSuspenseQuery(
    orpc.letter.getAllKatakana.queryOptions(),
  );
  const addQuizPoint = useWritingProgressStore((state) => state.addQuizPoint);
  const totalQuizPoints = useWritingProgressStore((state) =>
    state.getTotalQuizPoints(),
  );
  const [source, setSource] = useState<QuizSource>('hiragana');
  const [kanaPrompt, setKanaPrompt] = useState<KanaPrompt>('reading');
  const [prompt, setPrompt] = useState<KanjiPrompt>('meaning');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('choice');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [typedAnswer, setTypedAnswer] = useState('');

  const sourceLevel = Number(source.split('-')[1]);
  const jlptQuery = orpc.kanji.getKanjiByJlptLevel.queryOptions({
    input: { level: sourceLevel || 5 },
  });
  const joyoQuery = orpc.kanji.getKanjiByJoyoLevel.queryOptions({
    input: { level: sourceLevel || 1 },
  });
  const { data: jlptKanji = [], isLoading: isJlptLoading } = useQuery({
    ...jlptQuery,
    enabled: source.startsWith('jlpt-'),
  });
  const { data: joyoKanji = [], isLoading: isJoyoLoading } = useQuery({
    ...joyoQuery,
    enabled: source.startsWith('joyo-'),
  });
  const kanaList = source === 'hiragana' ? hiragana : katakana;
  const kanjiList = source.startsWith('jlpt-') ? jlptKanji : joyoKanji;
  const activeKana = kanaList[questionIndex % kanaList.length];
  const activeKanji = kanjiList[questionIndex % kanjiList.length];
  const kanjiOptionCharacters = useMemo(
    () =>
      kanjiList.length > 0
        ? getOptionIndexes(
            kanjiList.length,
            questionIndex % kanjiList.length,
          ).map((index) => kanjiList[index])
        : [],
    [kanjiList, questionIndex],
  );
  const kanjiDetailQueries = useQueries({
    queries: kanjiOptionCharacters.map((character) =>
      orpc.kanji.getKanjiDetails.queryOptions({ input: { character } }),
    ),
  });
  const kanjiDetails = kanjiDetailQueries
    .map((query) => query.data)
    .filter((detail): detail is NonNullable<typeof detail> => Boolean(detail));
  const activeKanjiDetails = kanjiDetails.find(
    (detail) => detail.kanji === activeKanji,
  );
  const isKanjiLoading =
    isJlptLoading ||
    isJoyoLoading ||
    kanjiDetailQueries.some((query) => query.isLoading);
  const kanaOptionIndexes = useMemo(
    () => getOptionIndexes(kanaList.length, questionIndex % kanaList.length),
    [kanaList.length, questionIndex],
  );
  const kanaOptions = kanaOptionIndexes.map((index) =>
    kanaPrompt === 'reading'
      ? kanaList[index].romaji
      : kanaList[index].character,
  );
  const kanjiOptions = kanjiDetails
    .map((detail) => getKanjiAnswer(detail, prompt))
    .filter((option) => option.length > 0);
  const answer =
    source === 'hiragana' || source === 'katakana'
      ? kanaPrompt === 'reading'
        ? activeKana?.romaji
        : activeKana?.character
      : activeKanjiDetails
        ? getKanjiAnswer(activeKanjiDetails, prompt)
        : undefined;
  const options =
    source === 'hiragana' || source === 'katakana' ? kanaOptions : kanjiOptions;
  const isLoading =
    source === 'hiragana' || source === 'katakana' ? false : isKanjiLoading;
  const canAnswer =
    !answerState &&
    Boolean(answer) &&
    (answerMode === 'input' || options.length > 1);

  const resetQuestion = (nextSource = source) => {
    const nextListLength =
      nextSource === 'hiragana'
        ? hiragana.length
        : nextSource === 'katakana'
          ? katakana.length
          : kanjiList.length;

    setQuestionIndex(
      pickRandomIndex(Math.max(nextListLength, 1), questionIndex),
    );
    setAnswerState(null);
    setSelectedAnswer(undefined);
    setTypedAnswer('');
  };

  const answerQuestion = (option: string, submittedAnswer = option) => {
    if (!canAnswer || !answer) {
      return;
    }

    setSelectedAnswer(option);

    if (!isCorrectAnswer(submittedAnswer, answer)) {
      setAnswerState('incorrect');
      return;
    }

    setAnswerState('correct');
    addQuizPoint({
      type: getSourceType(source),
      character: activeKana?.character ?? activeKanji,
    });
    toast.success('Correct answer saved to progress.');
  };

  const submitTypedAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    answerQuestion(typedAnswer, typedAnswer);
  };

  const description =
    'Choose a study set, answer multiple-choice prompts, and build quiz progress for dashboard and character mastery.';

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
      <Hero badge='練習' heading='Quiz' description={description} />

      <Card className='rounded-none border-border bg-card/70 shadow-none'>
        <CardHeader>
          <CardTitle>Quiz Setup</CardTitle>
          <CardDescription>
            Pick Hiragana, Katakana, a JLPT level, or a Joyo grade.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 sm:flex-row'>
          <Select
            value={source}
            onValueChange={(value) => {
              const nextSource = value as QuizSource;
              setSource(nextSource);
              resetQuestion(nextSource);
            }}
          >
            <SelectTrigger className='w-full sm:w-60'>
              <SelectValue placeholder='Select quiz source' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Kana</SelectLabel>
                <SelectItem value='hiragana'>Hiragana</SelectItem>
                <SelectItem value='katakana'>Katakana</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>JLPT</SelectLabel>
                {[5, 4, 3, 2, 1].map((level) => (
                  <SelectItem key={level} value={`jlpt-${level}`}>
                    JLPT N{level}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Joyo</SelectLabel>
                {[1, 2, 3, 4, 5, 6].map((grade) => (
                  <SelectItem key={grade} value={`joyo-${grade}`}>
                    Joyo Grade {grade}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={kanaPrompt}
            onValueChange={(value) => {
              setKanaPrompt(value as KanaPrompt);
              resetQuestion();
            }}
            disabled={source !== 'hiragana' && source !== 'katakana'}
          >
            <SelectTrigger className='w-full sm:w-52'>
              <SelectValue placeholder='Kana question type' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Kana Prompt</SelectLabel>
                {Object.entries(KANA_PROMPTS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={prompt}
            onValueChange={(value) => {
              setPrompt(value as KanjiPrompt);
              resetQuestion();
            }}
            disabled={source === 'hiragana' || source === 'katakana'}
          >
            <SelectTrigger className='w-full sm:w-52'>
              <SelectValue placeholder='Question type' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Kanji Prompt</SelectLabel>
                {Object.entries(KANJI_PROMPTS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={answerMode}
            onValueChange={(value) => {
              setAnswerMode(value as AnswerMode);
              setAnswerState(null);
              setSelectedAnswer(undefined);
              setTypedAnswer('');
            }}
          >
            <SelectTrigger className='w-full sm:w-52'>
              <SelectValue placeholder='Answer mode' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Answer Mode</SelectLabel>
                <SelectItem value='choice'>Multiple choice</SelectItem>
                <SelectItem value='input'>Input</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className='rounded-none border-border bg-card/70 shadow-none'>
        <CardHeader>
          <CardDescription>{getSourceLabel(source)}</CardDescription>
          <CardTitle className='text-3xl'>
            {source === 'hiragana' || source === 'katakana'
              ? kanaPrompt === 'reading'
                ? 'Choose the romaji reading'
                : 'Choose the character'
              : prompt === 'character'
                ? 'Choose the kanji character'
                : `Choose the ${KANJI_PROMPTS[prompt].toLowerCase()}`}
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <div className='grid min-h-[220px] place-items-center border border-border/70 bg-background'>
            {isLoading ? (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Spinner className='size-4' />
                Loading question...
              </div>
            ) : (
              <p className='font-sans-jp text-[140px] leading-none font-bold'>
                {source === 'hiragana' || source === 'katakana'
                  ? kanaPrompt === 'reading'
                    ? activeKana?.character
                    : activeKana?.romaji
                  : prompt === 'character'
                    ? getKanjiPromptText(activeKanjiDetails)
                    : activeKanji}
              </p>
            )}
          </div>

          {answerMode === 'choice' ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              {options.map((option) => {
                const isSelected = selectedAnswer === option;
                const isAnswer = answer === option;
                const variant =
                  answerState && isAnswer
                    ? 'default'
                    : answerState && isSelected
                      ? 'destructive'
                      : 'outline';

                return (
                  <Button
                    key={option}
                    type='button'
                    variant={variant}
                    disabled={!canAnswer}
                    className='h-auto justify-start py-3 text-left whitespace-normal'
                    onClick={() => answerQuestion(option)}
                  >
                    {answerState && isAnswer ? <Check /> : null}
                    {answerState && isSelected && !isAnswer ? <X /> : null}
                    {option}
                  </Button>
                );
              })}
            </div>
          ) : (
            <form
              className='flex flex-col gap-3 sm:flex-row'
              onSubmit={submitTypedAnswer}
            >
              <Input
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                placeholder='Type your answer...'
                aria-label='Quiz answer input'
                disabled={!canAnswer}
              />
              <Button
                type='submit'
                disabled={!canAnswer || typedAnswer.trim().length === 0}
              >
                Check answer
              </Button>
            </form>
          )}

          {answerState ? (
            <div className='rounded-md border border-border/70 bg-background px-4 py-3 text-sm'>
              <p
                className={
                  answerState === 'correct'
                    ? 'text-foreground'
                    : 'text-destructive'
                }
              >
                {answerState === 'correct' ? 'Correct.' : 'Incorrect.'}
              </p>
              <p className='mt-1 text-muted-foreground'>Answer: {answer}</p>
            </div>
          ) : null}

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-muted-foreground'>
              Total quiz points: {totalQuizPoints}
            </p>
            <Button type='button' onClick={() => resetQuestion()}>
              Next question
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function getKanjiAnswer(
  detail: {
    kanji?: string;
    meanings?: string[];
    on_readings?: string[];
    kun_readings?: string[];
  },
  prompt: KanjiPrompt,
) {
  if (prompt === 'meaning') {
    return detail.meanings?.[0] ?? '';
  }

  if (prompt === 'on') {
    return detail.on_readings?.[0] ?? '';
  }

  if (prompt === 'kun') {
    return detail.kun_readings?.[0] ?? '';
  }

  return detail.kanji ?? '';
}

function isCorrectAnswer(value: string, answer: string) {
  return value.trim().toLowerCase() === answer.trim().toLowerCase();
}

function getKanjiPromptText(
  detail:
    | {
        meanings?: string[];
        on_readings?: string[];
        kun_readings?: string[];
      }
    | undefined,
) {
  if (!detail) {
    return '-';
  }

  return (
    detail.meanings?.[0] ??
    detail.on_readings?.[0] ??
    detail.kun_readings?.[0] ??
    '-'
  );
}
