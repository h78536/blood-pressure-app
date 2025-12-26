:// This file is used to declare custom environment variables for Cloudflare
// It allows TypeScript to recognize properties attached at runtime, like AI bindings.

import type { AI } from './app/ai-provider';

// By declaring this module, we can extend the default CloudflareEnv type
declare module '@cloudflare/next-on-pages' {
  // We extend the CloudflareEnv interface to include our AI binding
  export interface CloudflareEnv {
    AI: AI;
  }
}
