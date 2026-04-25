import { ORPCError } from '@orpc/client';
import { baseRouter } from '@/orpc/base';
import { getKanjiDetailsSchema, getKanjiPageSchema } from './kanji-schema';
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

export const kanjiRouter = {
  getAllKanji,
  getKanjiPage,
  getKanjiDetails,
  getRandomKanji,
};
