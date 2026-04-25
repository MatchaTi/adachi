import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > 320);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateVisibility);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      type='button'
      variant='secondary'
      size='icon'
      className='fixed right-4 bottom-4 z-50 rounded-full shadow-lg shadow-black/10'
      aria-label='Scroll to top'
      title='Scroll to top'
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <ArrowUp className='size-4' />
    </Button>
  );
}
