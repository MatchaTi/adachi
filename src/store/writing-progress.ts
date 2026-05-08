import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type WritingCharacterType = 'hiragana' | 'katakana' | 'kanji';
export type QuizCharacterType = WritingCharacterType;

export type WritingProgressDay = {
  date: string;
  count: number;
};

export type WritingProgressData = {
  dailyProgress: Record<string, number>;
  completedCharacters: Record<string, number>;
  quizDailyProgress?: Record<string, number>;
  quizCompletedCharacters?: Record<string, number>;
};

type WritingProgressState = {
  dailyProgress: Record<string, number>;
  completedCharacters: Record<string, number>;
  quizDailyProgress: Record<string, number>;
  quizCompletedCharacters: Record<string, number>;
  addWritingPoint: (params: {
    type: WritingCharacterType;
    character: string;
  }) => number;
  addQuizPoint: (params: {
    type: QuizCharacterType;
    character: string;
  }) => number;
  exportProgressData: () => WritingProgressData;
  getDailyProgress: () => WritingProgressDay[];
  getCurrentDayStreak: () => number;
  getTotalWritingPoints: () => number;
  getTotalQuizPoints: () => number;
  importProgressData: (data: WritingProgressData) => void;
  resetProgressData: () => void;
};

const getLocalDateKey = (date = new Date()) => {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getCharacterKey = (type: WritingCharacterType, character: string) =>
  `${type}:${character}`;

const getPreviousDate = (date: Date) => {
  const previousDate = new Date(date);
  previousDate.setDate(date.getDate() - 1);

  return previousDate;
};

const countCurrentDayStreak = (dailyProgress: Record<string, number>) => {
  let cursor = new Date();
  let cursorKey = getLocalDateKey(cursor);

  if ((dailyProgress[cursorKey] ?? 0) === 0) {
    cursor = getPreviousDate(cursor);
    cursorKey = getLocalDateKey(cursor);
  }

  let streak = 0;

  while ((dailyProgress[cursorKey] ?? 0) > 0) {
    streak += 1;
    cursor = getPreviousDate(cursor);
    cursorKey = getLocalDateKey(cursor);
  }

  return streak;
};

export const useWritingProgressStore = create<WritingProgressState>()(
  persist(
    (set, get) => ({
      dailyProgress: {},
      completedCharacters: {},
      quizDailyProgress: {},
      quizCompletedCharacters: {},
      addWritingPoint: ({ type, character }) => {
        const date = getLocalDateKey();
        const characterKey = getCharacterKey(type, character);
        const nextCharacterCount =
          (get().completedCharacters[characterKey] ?? 0) + 1;

        set((state) => ({
          dailyProgress: {
            ...state.dailyProgress,
            [date]: (state.dailyProgress[date] ?? 0) + 1,
          },
          completedCharacters: {
            ...state.completedCharacters,
            [characterKey]: nextCharacterCount,
          },
        }));

        return nextCharacterCount;
      },
      addQuizPoint: ({ type, character }) => {
        const date = getLocalDateKey();
        const characterKey = getCharacterKey(type, character);
        const nextCharacterCount =
          (get().quizCompletedCharacters[characterKey] ?? 0) + 1;

        set((state) => ({
          quizDailyProgress: {
            ...state.quizDailyProgress,
            [date]: (state.quizDailyProgress[date] ?? 0) + 1,
          },
          quizCompletedCharacters: {
            ...state.quizCompletedCharacters,
            [characterKey]: nextCharacterCount,
          },
        }));

        return nextCharacterCount;
      },
      exportProgressData: () => {
        const {
          dailyProgress,
          completedCharacters,
          quizDailyProgress,
          quizCompletedCharacters,
        } = get();

        return {
          dailyProgress,
          completedCharacters,
          quizDailyProgress,
          quizCompletedCharacters,
        };
      },
      getDailyProgress: () =>
        Object.entries(get().dailyProgress)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      getCurrentDayStreak: () => countCurrentDayStreak(get().dailyProgress),
      getTotalWritingPoints: () =>
        Object.values(get().dailyProgress).reduce(
          (total, count) => total + count,
          0,
        ),
      getTotalQuizPoints: () =>
        Object.values(get().quizDailyProgress).reduce(
          (total, count) => total + count,
          0,
        ),
      importProgressData: ({
        dailyProgress,
        completedCharacters,
        quizDailyProgress = {},
        quizCompletedCharacters = {},
      }) => {
        set({
          dailyProgress,
          completedCharacters,
          quizDailyProgress,
          quizCompletedCharacters,
        });
      },
      resetProgressData: () => {
        set({
          dailyProgress: {},
          completedCharacters: {},
          quizDailyProgress: {},
          quizCompletedCharacters: {},
        });
      },
    }),
    {
      name: 'adachi-writing-progress',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState) => ({
        dailyProgress: {},
        completedCharacters: {},
        quizDailyProgress: {},
        quizCompletedCharacters: {},
        ...(persistedState as Partial<WritingProgressState>),
      }),
    },
  ),
);
