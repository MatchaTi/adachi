import kanji from 'kanji-data';
import kotowaza from 'kotowaza';
import type {
  GetKanjiDetailsInput,
  GetKanjiPageInput,
  GetKotowazaByKanjiInput,
} from './kanji-schema';

// service: panggil repository untuk CRUD logic
const getAllKanji = () => {
  const kanjiList = kanji.getAll(); // 13108 kanji

  return kanjiList;
};

const resolveKanjiSource = (search: string): string[] => {
  const normalizedSearch = search.trim();

  if (normalizedSearch.length === 0) {
    return kanji.getAll();
  }

  if (normalizedSearch.length === 1) {
    const kanjiDetails = kanji.get(normalizedSearch);

    if (kanjiDetails) {
      return [kanjiDetails.kanji];
    }
  }

  return kanji.search(normalizedSearch).map((result) => result.kanji);
};

const getKanjiPage = (input: GetKanjiPageInput) => {
  const { cursor, limit, search } = input;
  const kanjiList = resolveKanjiSource(search);
  const page = cursor ?? 0;
  const data = kanjiList.slice(page, page + limit);
  const nextCursor = page + limit < kanjiList.length ? page + limit : null;

  return {
    items: data,
    nextCursor,
  };
};

const getKanjiDetails = (input: GetKanjiDetailsInput) => {
  const { character } = input;
  const details = kanji.get(character);

  if (!details) {
    throw new Error(`Kanji not found for character: ${character}`);
  }

  return details;
};

const getRandomKanji = () => {
  const randomKanji = kanji.getRandom();

  if (!randomKanji) {
    return null;
  }

  return randomKanji;
};

const getKotowazaByKanji = (input: GetKotowazaByKanjiInput) => {
  const kotowazaList = kotowaza.search(input.character);

  if (kotowazaList.length === 0) {
    return [];
  }

  return kotowazaList;
};

const getRandomKotowaza = () => {
  const randomKotowaza = kotowaza.random();

  if (!randomKotowaza) {
    return null;
  }

  return randomKotowaza;
};

export const kanjiService = {
  getAllKanji,
  getKanjiPage,
  getKanjiDetails,
  getRandomKanji,
  getKotowazaByKanji,
  getRandomKotowaza,
};
