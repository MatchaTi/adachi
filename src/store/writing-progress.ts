import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type WritingCharacterType = 'hiragana' | 'katakana' | 'kanji';

export type WritingProgressDay = {
  date: string;
  count: number;
};

export type WritingProgressData = {
  dailyProgress: Record<string, number>;
  completedCharacters: Record<string, number>;
};

type WritingProgressState = {
  dailyProgress: Record<string, number>;
  completedCharacters: Record<string, number>;
  addWritingPoint: (params: {
    type: WritingCharacterType;
    character: string;
  }) => number;
  exportProgressData: () => WritingProgressData;
  getDailyProgress: () => WritingProgressDay[];
  getCurrentDayStreak: () => number;
  getTotalWritingPoints: () => number;
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
      exportProgressData: () => {
        const { dailyProgress, completedCharacters } = get();

        return {
          dailyProgress,
          completedCharacters,
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
      importProgressData: ({ dailyProgress, completedCharacters }) => {
        set({ dailyProgress, completedCharacters });
      },
      resetProgressData: () => {
        set({ dailyProgress: {}, completedCharacters: {} });
      },
    }),
    {
      name: 'adachi-writing-progress',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
