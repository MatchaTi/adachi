import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FlashcardPanelProps = {
  title: string;
  subtitle: string;
  frontValue: string;
  backValue: string;
  isBackVisible: boolean;
  onFlip: () => void;
  onNext: () => void;
  isNextLoading: boolean;
  disableActions?: boolean;
};

export function FlashcardPanel({
  title,
  subtitle,
  frontValue,
  backValue,
  isBackVisible,
  onFlip,
  onNext,
  isNextLoading,
  disableActions = false,
}: FlashcardPanelProps) {
  const displayValue = isBackVisible ? backValue : frontValue;
  const isLongValue = displayValue.length > 8;

  return (
    <div className='bg-card mx-auto w-full max-w-[300px] rounded-[24px]'>
      <div className='bg-foreground text-background rounded-t-[24px] px-6 pt-5 pb-16'>
        <ArrowLeft className='mb-3 size-5 opacity-90' />
        <h3 className='text-4xl leading-8 font-bold'>{title}</h3>
        <p className='text-background/80 mt-1 text-sm'>{subtitle}</p>
      </div>

      <div className='px-6 pb-6'>
        <div className='bg-background -mt-10 rounded-3xl border border-border px-6 py-7 text-center shadow-sm'>
          <p
            className={
              isLongValue
                ? 'text-foreground text-3xl leading-tight font-bold'
                : 'text-foreground text-8xl leading-none font-bold'
            }
          >
            {displayValue}
          </p>
        </div>

        <div className='mt-6 grid grid-cols-2 gap-2'>
          <Button
            type='button'
            variant='outline'
            className='rounded-lg'
            onClick={onNext}
            disabled={disableActions || isNextLoading}
          >
            {isNextLoading ? 'Shuffling...' : 'Next'}
          </Button>
          <Button
            type='button'
            className='rounded-lg'
            onClick={onFlip}
            disabled={disableActions}
          >
            {isBackVisible ? 'Show Front' : 'Flip Card'}
          </Button>
        </div>
      </div>
    </div>
  );
}
