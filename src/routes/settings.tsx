import { createFileRoute } from '@tanstack/react-router';
import { Download, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useWritingProgressStore,
  type WritingProgressData,
} from '@/store/writing-progress';

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
});

const EXPORT_FILE_NAME = 'adachi-progress.json';

const isRecordOfNumbers = (value: unknown): value is Record<string, number> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === 'number');
};

const parseProgressData = (value: unknown): WritingProgressData | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const data = value as Partial<WritingProgressData>;

  if (
    !isRecordOfNumbers(data.dailyProgress) ||
    !isRecordOfNumbers(data.completedCharacters)
  ) {
    return null;
  }

  return {
    dailyProgress: data.dailyProgress,
    completedCharacters: data.completedCharacters,
    quizDailyProgress: isRecordOfNumbers(data.quizDailyProgress)
      ? data.quizDailyProgress
      : {},
    quizCompletedCharacters: isRecordOfNumbers(data.quizCompletedCharacters)
      ? data.quizCompletedCharacters
      : {},
  };
};

function RouteComponent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const exportProgressData = useWritingProgressStore(
    (state) => state.exportProgressData,
  );
  const importProgressData = useWritingProgressStore(
    (state) => state.importProgressData,
  );
  const resetProgressData = useWritingProgressStore(
    (state) => state.resetProgressData,
  );
  const totalWritingPoints = useWritingProgressStore((state) =>
    state.getTotalWritingPoints(),
  );
  const totalQuizPoints = useWritingProgressStore((state) =>
    state.getTotalQuizPoints(),
  );
  const practicedCharacterCount = useWritingProgressStore(
    (state) =>
      new Set([
        ...Object.keys(state.completedCharacters),
        ...Object.keys(state.quizCompletedCharacters),
      ]).size,
  );
  const hasProgressData =
    totalWritingPoints > 0 ||
    totalQuizPoints > 0 ||
    practicedCharacterCount > 0;

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'adachi',
      version: 1,
      progress: exportProgressData(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = EXPORT_FILE_NAME;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Progress exported as JSON.');
  };

  const importJson = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setImportFileName(file.name);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const payload =
        parsed && typeof parsed === 'object' && 'progress' in parsed
          ? (parsed as { progress: unknown }).progress
          : parsed;
      const progressData = parseProgressData(payload);

      if (!progressData) {
        toast.error('Invalid progress JSON format.');
        return;
      }

      importProgressData(progressData);
      toast.success('Progress imported successfully.');
    } catch {
      toast.error('Failed to read progress JSON.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteProgress = () => {
    resetProgressData();
    setImportFileName('');
    toast.success('Progress data deleted.');
  };

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8'>
      <section className='flex flex-col gap-3 border-b border-border/70 pb-6'>
        <p className='text-xs tracking-[0.24em] text-muted-foreground uppercase'>
          Settings
        </p>
        <h1 className='text-4xl leading-tight sm:text-5xl'>Progress Data</h1>
        <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
          Export, import, or delete your local writing and quiz progress. Export
          and import use JSON files so your progress can be backed up manually.
        </p>
      </section>

      <section className='grid gap-4 sm:grid-cols-2'>
        <Card className='rounded-none border-border bg-card/70 shadow-none'>
          <CardHeader>
            <CardDescription>Writing Points</CardDescription>
            <CardTitle className='text-4xl'>{totalWritingPoints}</CardTitle>
          </CardHeader>
        </Card>

        <Card className='rounded-none border-border bg-card/70 shadow-none'>
          <CardHeader>
            <CardDescription>Practiced Characters</CardDescription>
            <CardTitle className='text-4xl'>
              {practicedCharacterCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className='rounded-none border-border bg-card/70 shadow-none'>
          <CardHeader>
            <CardDescription>Quiz Points</CardDescription>
            <CardTitle className='text-4xl'>{totalQuizPoints}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-none border-border bg-card/70 shadow-none'>
          <CardHeader>
            <CardTitle>Export JSON</CardTitle>
            <CardDescription>
              Download your writing progress as a JSON backup file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportJson} className='w-full'>
              <Download />
              Export Progress
            </Button>
          </CardContent>
        </Card>

        <Card className='rounded-none border-border bg-card/70 shadow-none'>
          <CardHeader>
            <CardTitle>Import JSON</CardTitle>
            <CardDescription>
              Restore progress from a previously exported JSON file.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <Input
              ref={fileInputRef}
              type='file'
              accept='application/json,.json'
              onChange={(event) => void importJson(event.target.files?.[0])}
            />
            {importFileName ? (
              <p className='text-xs text-muted-foreground'>
                Last selected: {importFileName}
              </p>
            ) : null}
            <Button
              type='button'
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
              className='w-full'
            >
              <Upload />
              Choose JSON File
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className='rounded-none border-destructive/50 bg-card/70 shadow-none'>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Destructive actions for your local progress data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4 rounded-none border border-destructive/30 p-4'>
              <div className='flex flex-col gap-1'>
                <p className='text-sm font-medium'>Delete Progress</p>
                <p className='text-sm text-muted-foreground'>
                  Permanently remove all local writing progress from this
                  browser.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='destructive'
                    className='w-full sm:w-fit'
                    disabled={!hasProgressData}
                  >
                    <Trash2 />
                    Delete Progress
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all progress?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Your daily progress, writing
                      points, streak, and character mastery data will be removed
                      from local storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant='destructive'
                      onClick={deleteProgress}
                    >
                      Delete Progress
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
