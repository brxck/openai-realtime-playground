import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReactStore } from '@/store';
import { useState } from 'react';

export function Instructions() {
  const [instructions, setInstructions] = useState(
    ReactStore.useValue('instructions'),
  );
  return (
    <details className="text-sm">
      <summary className="font-semibold">Instructions</summary>
      <Textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        className="min-h-80"
      />
      <div className="flex justify-end mt-2">
        <Button
          size="sm"
          onClick={ReactStore.useSetValueCallback(
            'instructions',
            () => instructions ?? '',
            [instructions],
          )}
        >
          Update
        </Button>
      </div>
    </details>
  );
}
