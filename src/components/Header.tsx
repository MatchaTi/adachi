import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { PROJECT_NAME_HIRAGANA } from '@/infra/lib/constants';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className='grid grid-cols-3 px-4 lg:px-80 mt-10'>
      <Button asChild variant={'ghost'} className='w-fit'>
        <Link to='/'>
          <h2 className='font-sans-jp'>{PROJECT_NAME_HIRAGANA}</h2>
        </Link>
      </Button>

      <nav className='p-1 border border-border rounded-full w-fit mx-auto space-x-1'>
        <Link to='/hiragana'>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'default' : 'outline'}
              size='sm'
              className='rounded-full'
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
              className='rounded-full'
            >
              ア <span className='hidden sm:inline'>Katakana</span>
            </Button>
          )}
        </Link>
      </nav>

      <div className='flex justify-end gap-2'>
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
