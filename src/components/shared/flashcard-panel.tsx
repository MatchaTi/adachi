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
  const isLongValue = displayValue.length > 1;

  return (
    <div className='bg-card border-border p-3 shadow-none rounded-xl'>
      <div className='bg-background relative grid h-[320px] place-items-center overflow-hidden rounded-md border border-border/60'>
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:50%_100%,100%_50%] opacity-70' />
        <p
          className={
            isLongValue
              ? 'relative z-[1] text-foreground font-sans-jp text-4xl font-bold leading-tight'
              : 'relative z-[1] text-foreground font-sans-jp text-[160px] font-bold leading-none'
          }
        >
          {displayValue}
        </p>
      </div>

      <div className='mt-4 grid grid-cols-2 gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={onNext}
          disabled={disableActions || isNextLoading}
          className='w-full'
        >
          {isNextLoading ? 'Shuffling...' : 'Next'}
        </Button>
        <Button
          type='button'
          onClick={onFlip}
          disabled={disableActions}
          className='w-full'
        >
          {isBackVisible ? 'Show Front' : 'Flip Card'}
        </Button>
      </div>
    </div>
  );
}
