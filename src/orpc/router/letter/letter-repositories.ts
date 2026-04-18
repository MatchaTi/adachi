import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type KanaCategory = 'hiragana' | 'katakana';

export type KanaGraphic = {
  character: string;
  strokes: string[];
  medians: number[][][];
  romaji: string;
  category: KanaCategory;
};

export type KanjiGraphic = {
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokes: number;
  jlpt: string;
  grade: string;
};

const kanaGraphicsPath = resolve(process.cwd(), 'public', 'graphicsJaKana.txt');
const kanjiGraphicsPath = resolve(process.cwd(), 'public', 'graphicsJa.txt');

function getKanaCategory(character: string): KanaCategory {
  const codePoint = character.codePointAt(0);

  if (codePoint === undefined) {
    throw new Error('Kana character is required');
  }

  if (codePoint >= 0x3040 && codePoint <= 0x309f) {
    return 'hiragana';
  }

  if (codePoint >= 0x30a0 && codePoint <= 0x30ff) {
    return 'katakana';
  }

  throw new Error(`Unsupported kana character: ${character}`);
}

function readKanaGraphics(): KanaGraphic[] {
  return readFileSync(kanaGraphicsPath, 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const graphic = JSON.parse(line) as Omit<KanaGraphic, 'category'>;

      return {
        ...graphic,
        category: getKanaCategory(graphic.character),
      };
    });
}

const kanaGraphics = readKanaGraphics();
const kanjiGraphics = readKanjiGraphics();

function readKanjiGraphics(): KanjiGraphic[] {
  return readFileSync(kanjiGraphicsPath, 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as KanjiGraphic);
}

function findKanaGraphic(category: KanaCategory, character: string) {
  return kanaGraphics.find(
    (graphic) =>
      graphic.category === category && graphic.character === character,
  );
}

export function getAllKanaGraphics(category: KanaCategory) {
  return kanaGraphics.filter((graphic) => graphic.category === category);
}

export function getKanaGraphic(category: KanaCategory, character: string) {
  return findKanaGraphic(category, character);
}

export function getAllHiraganaGraphics() {
  return getAllKanaGraphics('hiragana');
}

export function getHiraganaGraphic(character: string) {
  return getKanaGraphic('hiragana', character);
}

export function getAllKatakanaGraphics() {
  return getAllKanaGraphics('katakana');
}

export function getKatakanaGraphic(character: string) {
  return getKanaGraphic('katakana', character);
}

export function getAllKanjiGraphics() {
  return kanjiGraphics;
}

export function getKanjiGraphic(character: string) {
  return kanjiGraphics.find((graphic) => graphic.character === character);
}
