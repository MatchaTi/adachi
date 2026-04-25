import { Link } from '@tanstack/react-router';
import { PROJECT_NAME_HIRAGANA } from '@/infra/lib/constants';
import { NavDrawer } from './shared/nav-drawer';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className='flex items-center justify-between gap-4'>
      <Button asChild variant='ghost' className='w-fit px-0 sm:px-3'>
        <Link to='/'>
          <h2 className='font-sans-jp text-lg'>{PROJECT_NAME_HIRAGANA}</h2>
        </Link>
      </Button>

      <NavDrawer />
    </header>
  );
}
