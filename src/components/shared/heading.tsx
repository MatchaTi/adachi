import { cva } from 'class-variance-authority';
import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps extends HTMLAttributes<HTMLElement> {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const headingVariants = cva('', {
  variants: {
    level: {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-semibold',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-medium',
      h5: 'text-lg font-medium',
      h6: 'text-base font-medium',
    },
  },
  defaultVariants: {
    level: 'h1',
  },
});

export const Heading: FC<HeadingProps> = ({
  level: Component = 'h1',
  children,
  ...props
}) => {
  return (
    <Component
      {...props}
      className={cn(headingVariants({ level: Component }), props.className)}
    >
      {children}
    </Component>
  );
};
