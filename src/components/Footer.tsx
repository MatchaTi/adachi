import { Link } from '@tanstack/react-router';
import { HandCoins } from 'lucide-react';
import { Button } from './ui/button';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className='border-t border-border w-full py-10'>
      <div className='page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left'>
        <div>
          <p className='m-0 text-sm'>
            &copy; {year}{' '}
            <a
              href='https://github.com/MatchaTi'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline'
            >
              MatchaTi.
            </a>{' '}
            All rights reserved.
            <span className='mx-2 text-muted-foreground'>•</span>
            <Link to='/disclaimer' className='hover:underline'>
              Disclaimer
            </Link>
          </p>
          <p className='island-kicker m-0'>
            Built with TanStack Start + oRPC + Shadcn + Hanzi Writer
          </p>
        </div>

        <Button asChild variant={'ghost'}>
          <a
            href='https://trakteer.id/AdiIfai'
            target='_blank'
            rel='noopener noreferrer'
          >
            <HandCoins />
            Support me on Trakteer
          </a>
        </Button>
      </div>
    </footer>
  );
}
