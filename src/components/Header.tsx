import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { PROJECT_NAME_HIRAGANA } from '@/infra/lib/constants';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className='space-y-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4'>
      <div className='flex items-center justify-between gap-3 md:justify-start'>
        <Button asChild variant='ghost' className='w-fit px-0 sm:px-3'>
          <Link to='/'>
            <h2 className='font-sans-jp text-lg'>{PROJECT_NAME_HIRAGANA}</h2>
          </Link>
        </Button>

        <div className='flex items-center gap-2 md:hidden'>
          <ThemeToggle />
          <Button asChild size='sm'>
            <a
              href='https://github.com/MatchaTi/adachi'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Star on GitHub'
            >
              <Star />
            </a>
          </Button>
        </div>
      </div>

      <nav className='flex gap-1 overflow-x-auto rounded-full border border-border p-1 md:justify-center md:overflow-visible'>
        <Link to='/hiragana'>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'default' : 'outline'}
              size='sm'
              className='shrink-0 rounded-full px-3'
            >
              あ <span className='hidden sm:inline'>Hiragana</span>
            </Button>
          )}
        </Link>
        <Link to='/katakana'>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'default' : 'outline'}
              size='sm'
              className='shrink-0 rounded-full px-3'
            >
              ア <span className='hidden sm:inline'>Katakana</span>
            </Button>
          )}
        </Link>
        <Link to='/kanji'>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'default' : 'outline'}
              size='sm'
              className='shrink-0 rounded-full px-3'
            >
              漢 <span className='hidden sm:inline'>Kanji</span>
            </Button>
          )}
        </Link>
        <Link to='/analyze'>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'default' : 'outline'}
              size='sm'
              className='shrink-0 rounded-full px-3'
            >
              解析 <span className='hidden sm:inline'>Analyze</span>
            </Button>
          )}
        </Link>
      </nav>

      <div className='hidden justify-end gap-2 md:flex'>
        <ThemeToggle />
        <Button asChild>
          <a
            href='https://github.com/MatchaTi/adachi'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Star />
            <span className='hidden sm:inline'>Star on GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
