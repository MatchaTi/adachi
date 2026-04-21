import {
  getAllHiraganaGraphics,
  getAllKanjiGraphics,
  getAllKatakanaGraphics,
  getHiraganaGraphic,
  getKanjiGraphic,
  getKatakanaGraphic,
} from './letter-repositories';
import type {
  KanjiPageQueryInput,
  RandomKanaQueryInput,
} from './letter-schema';

export function listHiragana() {
  return getAllHiraganaGraphics();
}

export function findHiragana(character: string) {
  return getHiraganaGraphic(character);
}

export function getRandomHiraganaCard(input: RandomKanaQueryInput) {
  const hiragana = getAllHiraganaGraphics();

  if (hiragana.length === 0) {
    return null;
  }

  const candidates = input.excludeCharacter
    ? hiragana.filter((char) => char.character !== input.excludeCharacter)
    : hiragana;
  const source = candidates.length > 0 ? candidates : hiragana;
  const randomIndex = Math.floor(Math.random() * source.length);

  return source[randomIndex] ?? null;
}

export function listKatakana() {
  return getAllKatakanaGraphics();
}

export function findKatakana(character: string) {
  return getKatakanaGraphic(character);
}

export function getRandomKatakanaCard(input: RandomKanaQueryInput) {
  const katakana = getAllKatakanaGraphics();

  if (katakana.length === 0) {
    return null;
  }

  const candidates = input.excludeCharacter
    ? katakana.filter((char) => char.character !== input.excludeCharacter)
    : katakana;
  const source = candidates.length > 0 ? candidates : katakana;
  const randomIndex = Math.floor(Math.random() * source.length);

  return source[randomIndex] ?? null;
}

export function listKanji() {
  return getAllKanjiGraphics();
}

export function listKanjiPage(input: KanjiPageQueryInput) {
  const { cursor, limit, search } = input;
  const normalizedSearch = search.trim().toLowerCase();

  const source = getAllKanjiGraphics();
  const filtered =
    normalizedSearch.length === 0
      ? source
      : source.filter((kanji) => {
          const searchable = [kanji.character, kanji.romaji, kanji.arti]
            .join(' ')
            .toLowerCase();

          return searchable.includes(normalizedSearch);
        });

  const items = filtered.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < filtered.length ? cursor + limit : null;

  return {
    items,
    nextCursor,
    total: filtered.length,
  };
}

export function findKanji(character: string) {
  return getKanjiGraphic(character);
}

export function getRandomKanjiCard(input: RandomKanaQueryInput) {
  const kanji = getAllKanjiGraphics();

  if (kanji.length === 0) {
    return null;
  }

  const candidates = input.excludeCharacter
    ? kanji.filter((char) => char.character !== input.excludeCharacter)
    : kanji;
  const source = candidates.length > 0 ? candidates : kanji;
  const randomIndex = Math.floor(Math.random() * source.length);

  return source[randomIndex] ?? null;
}
