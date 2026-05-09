import { Link } from '@tanstack/react-router';
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  Menu,
  Star,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '../ThemeToggle';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
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

type NavLeafItem = {
  name: string;
  subtitle?: string;
  to?:
    | '/'
    | '/dashboard'
    | '/character-mastery'
    | '/quiz'
    | '/settings'
    | '/hiragana'
    | '/katakana'
    | '/kanji'
    | '/joyo'
    | '/analyze'
    | '/kotowaza'
    | '/jlpt'
    | '/jlpt/$n';
  href?: string;
  params?: {
    n: string;
  };
};

type NavBranchItem = {
  name: string;
  items: NavTreeItem[];
};

type NavTreeItem = NavLeafItem | NavBranchItem;

const NAV_TREE: NavTreeItem[] = [
  { name: 'home', subtitle: 'ホーム', to: '/' },
  { name: 'dashboard', subtitle: 'progress', to: '/dashboard' },
  { name: 'settings', subtitle: 'data', to: '/settings' },
  {
    name: 'character-mastery',
    subtitle: 'mastery',
    to: '/character-mastery',
  },
  { name: 'quiz', subtitle: '練習', to: '/quiz' },
  { name: 'hiragana', subtitle: 'ひらがな', to: '/hiragana' },
  { name: 'katakana', subtitle: 'カタカナ', to: '/katakana' },
  { name: 'kanji', subtitle: '漢字', to: '/kanji' },
  { name: 'joyo', subtitle: '常用漢字', to: '/joyo' },
  { name: 'kotowaza', subtitle: 'ことわざ', to: '/kotowaza' },
  { name: 'analyze', subtitle: '解析', to: '/analyze' },
  { name: 'jlpt', subtitle: '日本語能力試験', to: '/jlpt' },
  {
    name: 'joyo-levels',
    items: [
      { name: 'joyo-g1', subtitle: 'grade 1', href: '/joyo/1' },
      { name: 'joyo-g2', subtitle: 'grade 2', href: '/joyo/2' },
      { name: 'joyo-g3', subtitle: 'grade 3', href: '/joyo/3' },
      { name: 'joyo-g4', subtitle: 'grade 4', href: '/joyo/4' },
      { name: 'joyo-g5', subtitle: 'grade 5', href: '/joyo/5' },
      { name: 'joyo-g6', subtitle: 'grade 6', href: '/joyo/6' },
    ],
  },
  {
    name: 'jlpt-levels',
    items: [
      {
        name: 'jlpt-n5',
        subtitle: 'beginner',
        to: '/jlpt/$n',
        params: { n: '5' },
      },
      {
        name: 'jlpt-n4',
        subtitle: 'elementary',
        to: '/jlpt/$n',
        params: { n: '4' },
      },
      {
        name: 'jlpt-n3',
        subtitle: 'intermediate',
        to: '/jlpt/$n',
        params: { n: '3' },
      },
      {
        name: 'jlpt-n2',
        subtitle: 'advanced',
        to: '/jlpt/$n',
        params: { n: '2' },
      },
      {
        name: 'jlpt-n1',
        subtitle: 'expert',
        to: '/jlpt/$n',
        params: { n: '1' },
      },
    ],
  },
];

function renderNavItem(item: NavTreeItem) {
  if ('items' in item) {
    return (
      <Collapsible key={item.name}>
        <CollapsibleTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground'
          >
            <ChevronRightIcon className='transition-transform group-data-[state=open]:rotate-90' />
            <FolderIcon />
            {item.name}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='mt-1 ml-5 style-lyra:ml-4'>
          <div className='flex flex-col gap-1'>
            {item.items.map((child) => renderNavItem(child))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (item.to === '/jlpt/$n') {
    return (
      <Link key={item.name} to={item.to} params={{ n: item.params?.n ?? '5' }}>
        {({ isActive }) => (
          <DrawerClose asChild>
            <Button
              variant='link'
              size='sm'
              className={cn(
                'w-full justify-start gap-2 text-foreground',
                isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100',
              )}
            >
              <FileIcon />
              <span>{item.name}</span>
              {item.subtitle ? (
                <span className='text-xs text-muted-foreground'>
                  {item.subtitle}
                </span>
              ) : null}
            </Button>
          </DrawerClose>
        )}
      </Link>
    );
  }

  if (item.href) {
    return (
      <DrawerClose asChild key={item.name}>
        <Button
          variant='link'
          size='sm'
          asChild
          className='w-full justify-start gap-2 text-foreground'
        >
          <a href={item.href}>
            <FileIcon />
            <span>{item.name}</span>
            {item.subtitle ? (
              <span className='text-xs text-muted-foreground'>
                {item.subtitle}
              </span>
            ) : null}
          </a>
        </Button>
      </DrawerClose>
    );
  }

  if (!item.to) {
    return null;
  }

  return (
    <Link key={item.name} to={item.to}>
      {({ isActive }) => (
        <DrawerClose asChild>
          <Button
            variant='link'
            size='sm'
            className={cn(
              'w-full justify-start gap-2 text-foreground',
              isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100',
            )}
          >
            <FileIcon />
            <span>{item.name}</span>
            {item.subtitle ? (
              <span className='text-xs text-muted-foreground'>
                {item.subtitle}
              </span>
            ) : null}
          </Button>
        </DrawerClose>
      )}
    </Link>
  );
}

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
        <div className='px-4 grid gap-4'>
          <DrawerDescription>
            Menu for navigating between different pages. Click on an item to go
            to the corresponding page.
          </DrawerDescription>
          <Separator />
          <div className='flex flex-col gap-1'>
            {NAV_TREE.map((item) => renderNavItem(item))}
          </div>
        </div>
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
