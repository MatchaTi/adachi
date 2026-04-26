import { ORPCError } from '@orpc/client';
import { baseRouter } from '@/orpc/base';
import {
  getKanjiDetailsSchema,
  getKanjiPageSchema,
  getKotowazaByKanjiSchema,
} from './kanji-schema';
import { kanjiService } from './kanji-services';

// controller: handle request & response, panggil service
const getAllKanji = baseRouter.handler(() => {
  return kanjiService.getAllKanji();
});

const getKanjiPage = baseRouter
  .input(getKanjiPageSchema)
  .handler(({ input }) => {
    return kanjiService.getKanjiPage(input);
  });

const getKanjiDetails = baseRouter
  .input(getKanjiDetailsSchema)
  .handler(({ input }) => {
    const kanjiDetails = kanjiService.getKanjiDetails(input);

    if (!kanjiDetails) {
      throw new ORPCError('NOT_FOUND', {
        message: `Kanji details not found for character: ${input.character}`,
      });
    }

    return kanjiDetails;
  });

const getRandomKanji = baseRouter.handler(() => {
  const randomKanji = kanjiService.getRandomKanji();

  if (!randomKanji) {
    throw new ORPCError('NOT_FOUND', {
      message: 'No kanji found',
    });
  }

  return randomKanji;
});

const getKotowazaByKanji = baseRouter
  .input(getKotowazaByKanjiSchema)
  .handler(({ input }) => {
    const kotowazaList = kanjiService.getKotowazaByKanji(input);

    if (kotowazaList.length === 0) {
      throw new ORPCError('NOT_FOUND', {
        message: `No kotowaza found for kanji: ${input.character}`,
      });
    }

    return kotowazaList;
  });

const getRandomKotowaza = baseRouter.handler(() => {
  const randommKotowaza = kanjiService.getRandomKotowaza();

  if (!randommKotowaza) {
    throw new ORPCError('NOT_FOUND', {
      message: 'No kotowaza found',
    });
  }

  return randommKotowaza;
});

export const kanjiRouter = {
  getAllKanji,
  getKanjiPage,
  getKanjiDetails,
  getRandomKanji,
  getKotowazaByKanji,
  getRandomKotowaza,
};
