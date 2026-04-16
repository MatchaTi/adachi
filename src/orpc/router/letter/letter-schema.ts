import { z } from 'zod';

export const kanaCharacterSchema = z.object({
  character: z.string().min(1).max(1),
});

export type KanaCharacterInput = z.infer<typeof kanaCharacterSchema>;
