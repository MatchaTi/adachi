import { createFileRoute } from '@tanstack/react-router';
import { Heading } from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { PROJECT_NAME_HIRAGANA } from '@/infra/lib/constants';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main>
      <Heading className='font-sans-jp'>{PROJECT_NAME_HIRAGANA}</Heading>
      <Button>{PROJECT_NAME_HIRAGANA}</Button>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, adipisci
        aperiam rerum error ipsam sequi, beatae esse a cumque, repudiandae nihil
        suscipit voluptate ducimus! Necessitatibus non vel sed assumenda
        facilis?
      </p>
    </main>
  );
}
