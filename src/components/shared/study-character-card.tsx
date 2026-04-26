import type { HTMLAttributes } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface StudyCharacterCardProps extends HTMLAttributes<HTMLDivElement> {
  character: string;
  badge: string;
}

export function StudyCharacterCard({
  character,
  badge,
  className,
  ...props
}: StudyCharacterCardProps) {
  return (
    <Card
      {...props}
      className={cn(
        'group relative overflow-hidden rounded-none border-border bg-card/70 shadow-none transition-transform duration-200 hover:-translate-y-1 sm:aspect-square',
        className,
      )}
    >
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-0 transition-opacity duration-200 group-hover:opacity-40' />
      <CardHeader className='relative flex h-full items-center justify-center p-6'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <CardTitle className='font-sans-jp text-[clamp(2.75rem,6vw,4.75rem)] leading-none'>
            {character}
          </CardTitle>
          <Badge
            variant={'outline'}
            className='text-[10px] text-muted-foreground'
          >
            {badge}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
