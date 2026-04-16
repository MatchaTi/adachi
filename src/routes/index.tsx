import { createFileRoute, Link } from '@tanstack/react-router';
import Hero from '@/components/shared/hero';
import { Button } from '@/components/ui/button';
import { PROJECT_NAME, PROJECT_NAME_HIRAGANA } from '@/infra/lib/constants';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const description =
    'Platform for learning how to write and read Japanese characters, including Hiragana and Katakana.';

  return (
    <main>
      <Hero
        badge={PROJECT_NAME_HIRAGANA}
        heading={PROJECT_NAME}
        description={description}
      >
        <div className='space-x-4'>
          <Button asChild>
            <Link to='/hiragana'>あ Hiragana</Link>
          </Button>
          <Button asChild>
            <Link to='/katakana'>ア Katakana</Link>
          </Button>
        </div>
      </Hero>
    </main>
  );
}
