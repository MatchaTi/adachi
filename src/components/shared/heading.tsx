import { cva } from 'class-variance-authority';
import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps extends HTMLAttributes<HTMLElement> {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const headingVariants = cva('', {
  variants: {
    level: {
      h1: 'text-3xl md:text-4xl lg:text-5xl font-bold',
      h2: 'text-2xl md:text-3xl lg:text-4xl font-semibold',
      h3: 'text-xl md:text-2xl lg:text-3xl font-semibold',
      h4: 'text-lg md:text-xl lg:text-2xl font-medium',
      h5: 'text-base md:text-lg lg:text-xl font-medium',
      h6: 'text-sm md:text-base lg:text-lg font-medium',
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
