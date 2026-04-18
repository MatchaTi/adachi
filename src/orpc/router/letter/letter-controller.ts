import { ORPCError } from '@orpc/server';
import { baseRouter } from '@/orpc/base';
import { kanaCharacterSchema } from './letter-schema';
import {
  findHiragana,
  findKanji,
  findKatakana,
  listHiragana,
  listKanji,
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

export const getAllKanji = baseRouter.handler(() => {
  return listKanji();
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

export const letterRouter = {
  getAllHiragana,
  getHiragana,
  getAllKatakana,
  getKatakana,
  getAllKanji,
  getKanji,
};
