import * as React from 'react';
import { Spinner } from '@cyberlisans/ui/atoms';

export default function AdminLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
