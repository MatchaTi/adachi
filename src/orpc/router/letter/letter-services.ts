import {
  getAllHiraganaGraphics,
  getAllKanjiGraphics,
  getAllKatakanaGraphics,
  getHiraganaGraphic,
  getKanjiGraphic,
  getKatakanaGraphic,
} from './letter-repositories';
import type { KanjiPageQueryInput } from './letter-schema';

export function listHiragana() {
  return getAllHiraganaGraphics();
}

export function findHiragana(character: string) {
  return getHiraganaGraphic(character);
}

export function listKatakana() {
  return getAllKatakanaGraphics();
}

export function findKatakana(character: string) {
  return getKatakanaGraphic(character);
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
