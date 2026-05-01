import { getFormProps, getTextareaProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Heading } from '@/components/shared/heading';
import Hero from '@/components/shared/hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { orpc } from '@/orpc/client';
import {
  type AnalyzeResponse,
  analyzeSchema,
} from '@/orpc/router/analyze/analyze-schema';

const posLabels: Record<AnalyzeResponse['tokens'][number]['pos'], string> = {
  noun: 'Noun',
  propn: 'Proper noun',
  pron: 'Pronoun',
  verb: 'Verb',
  aux: 'Auxiliary',
  adj: 'Adjective',
  adv: 'Adverb',
  adp: 'Particle / adposition',
  det: 'Determiner',
  num: 'Number',
  part: 'Particle',
  cconj: 'Coordinating conjunction',
  sconj: 'Subordinating conjunction',
  intj: 'Interjection',
  punct: 'Punctuation',
  sym: 'Symbol',
};

function formatTokenLabel(token: AnalyzeResponse['tokens'][number]) {
  return posLabels[token.pos] ?? token.pos;
}

export const Route = createFileRoute('/analyze')({
  head: () => ({
    meta: [
      { title: 'Sentence Analysis - Adachi' },
      {
        name: 'description',
        content:
          'Break down Japanese sentences into tokens, readings, script types, and parts of speech with detailed analysis.',
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const description =
    'Analyze your sentences and get insights on particles, sentence patterns, and more.';

  const { mutate, isPending, data } = useMutation({
    mutationFn: (text: string) => orpc.analyze.analyzeSentence.call({ text }),
    onSuccess: () => {
      toast.dismiss();
      toast.success('Sentence analyzed successfully!');
    },
  });

  const [form, fields] = useForm({
    id: 'analyze-form',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: analyzeSchema });
    },
    onSubmit(e, { submission }) {
      e.preventDefault();

      if (submission?.status !== 'success') return submission?.reply();

      try {
        toast.loading('Analyzing sentence...');
        mutate(submission.value.text);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    },
  });

  return (
    <main>
      <Hero badge='アナライズ' heading='Analyze' description={description} />

      <div className='space-y-6'>
        <Heading>Analyze Sentence</Heading>
        <p className='text-sm'>
          Enter a Japanese sentence to see a tokenized breakdown with readings,
          parts of speech, and script types. Hover over each token for detailed
          insights.
        </p>
        <form {...getFormProps(form)} method='POST' className='space-y-6'>
          <Field>
            <FieldLabel id='sentence'>Sentence</FieldLabel>
            <Textarea
              {...getTextareaProps(fields.text)}
              id='sentence'
              placeholder='Enter a Japanese sentence to analyze...'
              disabled={isPending}
              className='min-h-40 resize-y border-border bg-background'
            />
            <FieldError>{fields.text.errors}</FieldError>
          </Field>
          <Button className='w-full sm:w-auto'>
            {isPending ? (
              <>
                <Spinner /> Analyzing...
              </>
            ) : (
              <>Analyze</>
            )}
          </Button>
        </form>

        <div className='space-y-6 mb-10 border-t border-border pt-6'>
          {data && (
            <div className='space-y-4'>
              <Heading>Analysis Result</Heading>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge variant='secondary'>Analysis result</Badge>
                <Badge variant='outline'>{data.tokens.length} tokens</Badge>
              </div>

              <div className='space-y-3'>
                <p className='text-sm'>
                  Hover each token to inspect the reading, script, and part of
                  speech.
                </p>
                <p className='font-sans-jp text-lg leading-9 text-foreground'>
                  {data.tokens.map((token) => (
                    <Tooltip
                      key={`${token.text}-${token.romaji}-${token.pos}-${token.script_type}-${token.hiragana}`}
                    >
                      <TooltipTrigger className='hover:underline hover:bg-secondary'>
                        {token.text}
                      </TooltipTrigger>
                      <TooltipContent className='border border-border bg-foreground px-0 py-0 shadow-2xl'>
                        <div className='space-y-4 p-4'>
                          <div className='flex items-start justify-between gap-3'>
                            <div>
                              <h3 className='font-sans-jp text-lg font-semibold leading-none'>
                                {token.text}
                              </h3>
                              <p className='mt-1 text-xs uppercase tracking-[0.24em]'>
                                {token.romaji}
                              </p>
                            </div>
                            <Badge className='capitalize'>
                              {token.script_type}
                            </Badge>
                          </div>

                          <div className='grid gap-3 text-sm sm:grid-cols-2'>
                            <div className='rounded bg-background px-3 py-2'>
                              <p className='text-[10px] uppercase tracking-[0.24em]'>
                                Part of speech
                              </p>
                              <p className='mt-1 font-medium'>
                                {formatTokenLabel(token)}
                              </p>
                            </div>
                            <div className='rounded bg-background px-3 py-2'>
                              <p className='text-[10px] uppercase tracking-[0.24em]'>
                                Hiragana reading
                              </p>
                              <p className='mt-1 font-medium font-sans-jp'>
                                {token.hiragana}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </p>
              </div>
            </div>
          )}

          {isPending && (
            <p className='flex items-center justify-center gap-2 text-center text-sm text-muted-foreground'>
              <Spinner className='size-4' />
              Analyzing sentence...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
