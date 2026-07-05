'use client';

import * as React from 'react';
import { User, Shield } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';
import { cn } from '@cyberlisans/ui/cn';
import { formatDateTime } from '@/lib/format';

export interface DisputeMessage {
  id: string;
  author: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  authorName: string;
  content: string;
  createdAt: string;
}

export interface DisputeMessagesProps {
  messages: DisputeMessage[];
}

export function DisputeMessages({ messages }: DisputeMessagesProps) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-white/50">Mesaj yok.</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="font-orbitron text-base font-bold text-white">Mesaj Geçmişi</h3>
        <ol className="space-y-3">
          {messages.map((m) => {
            const isAdmin = m.author === 'ADMIN';
            return (
              <li
                key={m.id}
                className={cn(
                  'rounded-md border p-3',
                  isAdmin
                    ? 'border-cyber-magenta/30 bg-cyber-magenta/5'
                    : 'border-cyber-cyan/20 bg-cyber-cyan/5',
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-white">
                    {isAdmin ? (
                      <Shield className="h-3.5 w-3.5 text-cyber-magenta" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-cyber-cyan" />
                    )}
                    {m.authorName}
                    <span className="text-white/40">({m.author})</span>
                  </div>
                  <time className="text-white/40">{formatDateTime(m.createdAt)}</time>
                </div>
                <p className="mt-2 text-sm text-white/80">{m.content}</p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
