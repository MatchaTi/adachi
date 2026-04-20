import { z } from 'zod';

// schema: validasi input pakai Zod
export const analyzeSchema = z.object({
  text: z.string({ error: 'Text is required' }).min(1, 'Text is required'),
});

export type AnalyzeSchema = z.infer<typeof analyzeSchema>;
export type AnalyzeResponse = {
  original_text: string;
  tokens: Array<{
    text: string;
    script_type: 'Hiragana' | 'Katakana' | 'Kanji';
    pos:
      | 'noun'
      | 'propn'
      | 'pron'
      | 'verb'
      | 'aux'
      | 'adj'
      | 'adv'
      | 'adp'
      | 'det'
      | 'num'
      | 'part'
      | 'cconj'
      | 'sconj'
      | 'intj'
      | 'punct'
      | 'sym';
    hiragana: string;
    romaji: string;
  }>;
};
