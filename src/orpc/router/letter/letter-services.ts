import {
  getAllHiraganaGraphics,
  getAllKatakanaGraphics,
  getHiraganaGraphic,
  getKatakanaGraphic,
} from './letter-repositories';

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
