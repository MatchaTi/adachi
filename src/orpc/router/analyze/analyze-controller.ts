import { ORPCError } from '@orpc/client';
import { api } from '@/lib/api';
import { baseRouter } from '@/orpc/base';
import { type AnalyzeResponse, analyzeSchema } from './analyze-schema';

// controller: handle request & response, panggil service
const analyzeSentence = baseRouter
  .input(analyzeSchema)
  .route({ method: 'POST' })
  .handler(async ({ input }) => {
    const response = await api.post<AnalyzeResponse>('/analyze', {
      text: input.text,
    });

    if (response.status !== 200) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Failed to analyze the sentence',
      });
    }

    return response.data;
  });

export const analyzeRouter = {
  analyzeSentence,
};
