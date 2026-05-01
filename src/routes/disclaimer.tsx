import { createFileRoute } from '@tanstack/react-router';
import { Heading } from '@/components/shared/heading';
import Hero from '@/components/shared/hero';
import { PROJECT_NAME } from '@/infra/lib/constants';

export const Route = createFileRoute('/disclaimer')({
  head: () => ({
    meta: [
      { title: 'Disclaimer - Adachi' },
      {
        name: 'description',
        content:
          'Important disclaimer and information about the Adachi Japanese learning application.',
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const description =
    'This is a disclaimer page. Please read the following information carefully before using this website.';

  const lastUpdated = 'April 26, 2026';
  return (
    <main>
      <Hero
        badge='ディスクレーマー'
        heading='Disclaimer'
        description={description}
      />
      <div className='prose max-w-none leading-relaxed space-y-8 dark:prose-invert'>
        <p className='italic'>Last Update: {lastUpdated}</p>

        <section>
          <Heading level='h4'>1. Educational Purpose</Heading>
          <p>
            All content provided in the {PROJECT_NAME} application, including
            but not limited to Hiragana, Katakana, Kanji characters, and
            proverbs, is intended solely for self-educational and informational
            purposes.
          </p>
        </section>

        <section>
          <Heading level='h4'>2. Accuracy of Information</Heading>
          <p>
            We strive to provide accurate data. However, Japanese is a complex
            language with various interpretations. {PROJECT_NAME} does not
            guarantee the absolute accuracy, completeness, or reliability of the
            data presented. Technical or human errors in the dataset may occur.
          </p>
        </section>

        <section>
          <Heading level='h4'>3. Learning Outcomes</Heading>
          <p>
            Use of this application does not guarantee any specific level of
            proficiency or success in official language exams (such as JLPT).
            Learning outcomes are entirely dependent on the individual effort of
            each user.
          </p>
        </section>

        <section>
          <Heading level='h4'>4. Third-Party Data</Heading>
          <p>
            {PROJECT_NAME} uses third-party libraries and datasets (such as{' '}
            <a
              href='https://github.com/chanind/hanzi-writer'
              target='_blank'
              rel='noopener noreferrer'
            >
              <code>hanzi-writer</code>
            </a>
            ,
            <a
              href='https://github.com/sepTN/kanji-data'
              target='_blank'
              rel='noopener noreferrer'
            >
              <code>kanji-data</code>
            </a>
            , and
            <a
              href='https://github.com/sepTN/kotowaza'
              target='_blank'
              rel='noopener noreferrer'
            >
              <code>kotowaza</code>
            </a>
            ) to support interactive features. The copyright of these datasets
            remains with their original owners. We are not responsible for any
            changes or discontinuation of services from those data providers.
          </p>
        </section>

        <section>
          <Heading level='h4'>5. Limitation of Liability</Heading>
          <p>
            The developer shall not be liable for any damages (direct or
            indirect) arising from the use of the application, including but not
            limited to failure in exams or miscommunication in Japanese language
            caused by the use of data from this application.
          </p>
        </section>
      </div>
    </main>
  );
}
