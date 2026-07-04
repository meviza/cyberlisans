import * as React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface FormAlertProps {
  error: string | null;
  success: string | null;
}

export function FormAlert({ error, success }: FormAlertProps) {
  if (!error && !success) return null;

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-2 text-sm text-cyber-magenta">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-cyber-lime/40 bg-cyber-lime/10 px-3 py-2 text-sm text-cyber-lime">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{success}</span>
    </div>
  );
}
