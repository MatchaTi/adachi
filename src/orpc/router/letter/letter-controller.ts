import { ORPCError } from '@orpc/server';
import { baseRouter } from '@/orpc/base';
import {
  kanaCharacterSchema,
  kanjiPageQuerySchema,
  randomKanaQuerySchema,
} from './letter-schema';
import {
  findHiragana,
  findKanji,
  findKatakana,
  getRandomHiraganaCard,
  getRandomKanjiCard,
  getRandomKatakanaCard,
  listHiragana,
  listKanji,
  listKanjiPage,
  listKatakana,
} from './letter-services';

export const getAllHiragana = baseRouter.handler(() => {
  return listHiragana();
});

export const getHiragana = baseRouter
  .input(kanaCharacterSchema)
  .handler(({ input }) => {
    const letter = findHiragana(input.character);

    if (!letter) {
      throw new ORPCError('NOT_FOUND', {
        message: `Hiragana ${input.character} not found`,
      });
    }

    return letter;
  });

export const getRandomHiragana = baseRouter
  .input(randomKanaQuerySchema)
  .handler(({ input }) => {
    const card = getRandomHiraganaCard(input);

    if (!card) {
      throw new ORPCError('NOT_FOUND', {
        message: 'No hiragana card found',
      });
    }

    return card;
  });

export const getAllKatakana = baseRouter.handler(() => {
  return listKatakana();
});

export const getKatakana = baseRouter
  .input(kanaCharacterSchema)
  .handler(({ input }) => {
    const letter = findKatakana(input.character);

    if (!letter) {
      throw new ORPCError('NOT_FOUND', {
        message: `Katakana ${input.character} not found`,
      });
    }

    return letter;
  });

export const getRandomKatakana = baseRouter
  .input(randomKanaQuerySchema)
  .handler(({ input }) => {
    const card = getRandomKatakanaCard(input);

    if (!card) {
      throw new ORPCError('NOT_FOUND', {
        message: 'No katakana card found',
      });
    }

    return card;
  });

export const getAllKanji = baseRouter.handler(() => {
  return listKanji();
});

export const getKanjiPage = baseRouter
  .input(kanjiPageQuerySchema)
  .handler(({ input }) => {
    return listKanjiPage(input);
  });

export const getKanji = baseRouter
  .input(kanaCharacterSchema)
  .handler(({ input }) => {
    const letter = findKanji(input.character);

    if (!letter) {
      throw new ORPCError('NOT_FOUND', {
        message: `Kanji ${input.character} not found`,
      });
    }

    return letter;
  });

export const getRandomKanji = baseRouter
  .input(randomKanaQuerySchema)
  .handler(({ input }) => {
    const card = getRandomKanjiCard(input);

    if (!card) {
      throw new ORPCError('NOT_FOUND', {
        message: 'No kanji card found',
      });
    }

    return card;
  });

export const letterRouter = {
  getAllHiragana,
  getHiragana,
  getRandomHiragana,
  getAllKatakana,
  getKatakana,
  getRandomKatakana,
  getAllKanji,
  getKanjiPage,
  getKanji,
  getRandomKanji,
};
