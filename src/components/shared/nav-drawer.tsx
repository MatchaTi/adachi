import { Link } from '@tanstack/react-router';
import { Menu, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '../ThemeToggle';
import { Button } from '../ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';
import { Separator } from '../ui/separator';
import { Heading } from './heading';

const NAV_ITEMS = [
  { to: '/', label: 'Home', char: 'ホーム' },
  { to: '/hiragana', label: 'Hiragana', char: 'ひらがな' },
  { to: '/katakana', label: 'Katakana', char: 'カタカナ' },
  { to: '/kanji', label: 'Kanji', char: '漢字' },
  { to: '/analyze', label: 'Analyze', char: '解析' },
  { to: '/kotowaza', label: 'Kotowaza', char: 'ことわざ' },
];

export function NavDrawer() {
  return (
    <Drawer direction='right'>
      <DrawerTrigger asChild>
        <div className='bg-foreground text-background rounded-full p-2 flex items-center gap-1'>
          <a
            href='https://github.com/MatchaTi/adachi'
            target='_blank'
            rel='noopener noreferrer'
            className='bg-background text-foreground rounded-full py-2 px-4 flex items-center gap-2 text-sm'
          >
            <Star size={14} />
            Star on GitHub
          </a>
          <Button variant={'ghost'} size={'icon'} className='rounded-full'>
            <Menu />
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className='border-none'>
        <DrawerHeader className='flex flex-row items-center justify-between'>
          <DrawerTitle asChild>
            <Heading level='h3'>Menu</Heading>
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant={'outline'}
              size={'icon'}
              className='rounded-full border-border'
            >
              <X />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <ul className='px-4 grid gap-4'>
          <DrawerDescription>
            Menu for navigating between different pages. Click on an item to go
            to the corresponding page.
          </DrawerDescription>
          <Separator />
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to}>
              {({ isActive }) => (
                <DrawerClose asChild>
                  <div
                    className={cn(
                      isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100',
                    )}
                  >
                    <Heading level='h6'>{item.label}</Heading>
                    <p>{item.char}</p>
                  </div>
                </DrawerClose>
              )}
            </Link>
          ))}
        </ul>
        <DrawerFooter>
          {/* TODO: add tip page for users to support the project */}
          <ThemeToggle />
          <Button asChild>
            <a
              href='https://github.com/MatchaTi/adachi'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Star />
              Star on GitHub
            </a>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
