import { z } from 'zod';

export const kanaCharacterSchema = z.object({
  character: z.string().min(1).max(1),
});

export type KanaCharacterInput = z.infer<typeof kanaCharacterSchema>;

export const kanjiPageQuerySchema = z.object({
  cursor: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(40),
  search: z.string().default(''),
});

export type KanjiPageQueryInput = z.infer<typeof kanjiPageQuerySchema>;
