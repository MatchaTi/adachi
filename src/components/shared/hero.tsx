import { Heading } from './heading';

type Props = {
  heading: string;
  badge: string;
  description: string;
  children?: React.ReactNode;
};

export default function Hero({ heading, badge, description, children }: Props) {
  return (
    <div className='space-y-12 mt-10 lg:mt-20'>
      <Heading
        level='h2'
        className='font-sans-jp bg-foreground w-fit text-background'
      >
        {badge}
      </Heading>
      <div className='relative px-4 border-y border-dashed border-muted-foreground'>
        <Heading className='text-[12vw]! leading-[9vw]'>{heading}</Heading>
        <div className='w-4 aspect-square border absolute bg-background top-0 left-0 -translate-1/2'></div>
        <div className='w-4 aspect-square border absolute bg-background top-0 right-0 -translate-y-1/2 translate-x-1/2'></div>
        <div className='w-4 aspect-square border absolute bg-background bottom-0 left-0 translate-y-1/2 -translate-x-1/2'></div>
        <div className='w-4 aspect-square border absolute bg-background bottom-0 right-0 translate-y-1/2 translate-x-1/2'></div>
      </div>
      <div className='space-y-8 px-4'>
        <p className='mt-20'>{description}</p>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
