import * as React from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';

export interface SubmitButtonProps {
  submitting: boolean;
}

export function SubmitButton({ submitting }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={submitting} className="w-full">
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Gönderiliyor...
        </>
      ) : (
        <>
          <Star className="h-4 w-4" /> Başvuruyu Gönder
        </>
      )}
    </Button>
  );
}
