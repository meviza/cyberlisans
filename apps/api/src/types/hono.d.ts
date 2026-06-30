import type { AccessTokenPayload } from '@cyberlisans/auth';

declare module 'hono' {
  interface ContextVariableMap {
    user: AccessTokenPayload;
  }
}

export {};