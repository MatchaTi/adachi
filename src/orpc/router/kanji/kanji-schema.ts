import { z } from 'zod';

export const kanjiSchema = z.object({
  character: z.string(),
  meaning: z.string(),
  strokes: z.number(),
  onyomi: z.string(),
  kunyomi: z.string(),
  level: z.number(),
  jlpt: z.number(),
  frequency: z.number(),
  meaning_id: z.string(),
  kunyomi_id: z.string(),
  onyomi_id: z.string(),
  arti: z.string(),
});

export const getKanjiSchema = z.object({
  character: z.string(),
});

export const getKanjiPageSchema = z.object({
  cursor: z.number().nullish(),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().default(''),
});

export const getKanjiDetailsSchema = z.object({
  character: z.string().min(1).max(1),
});

export type Kanji = z.infer<typeof kanjiSchema>;
export type GetKanjiPageInput = z.infer<typeof getKanjiPageSchema>;
export type GetKanjiDetailsInput = z.infer<typeof getKanjiDetailsSchema>;
