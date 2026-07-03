'use client';

import * as React from 'react';
import { Badge, Button, Card, CardContent, Spinner } from '@cyberlisans/ui/atoms';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ApiError } from '@/lib/api-client';

export function AdminTableShell({
  title,
  description,
  count,
  children,
  loading,
  error,
  onRetry,
}: {
  title: string;
  description: string;
  count?: number;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyber-cyan/20 p-5">
          <div>
            <h2 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
              {title}
            </h2>
            <p className="mt-1 text-xs text-white/50">{description}</p>
          </div>
          {count !== undefined && <Badge variant="cyan">{count} kayıt</Badge>}
        </div>

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <div className="m-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyber-magenta/30 bg-cyber-magenta/5 p-4 text-sm text-cyber-magenta">
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </span>
            {onRetry && (
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-3.5 w-3.5" />
                Tekrar Dene
              </Button>
            )}
          </div>
        )}

        {!loading && !error && children}
      </CardContent>
    </Card>
  );
}

export function getAdminErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  return fallback;
}
