import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization - clients are created only when accessed
let clientInstance: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    // Don't throw during build - return placeholder
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      console.warn('NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    return 'https://placeholder.supabase.co';
  }
  return url;
}

function getSupabaseKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    // Don't throw during build - return placeholder
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
    return 'placeholder-key';
  }
  return key;
}

// Lazy client getter - only creates client when actually used
export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(getSupabaseUrl(), getSupabaseKey());
  }
  return clientInstance;
}

// Server-side Supabase client (for API routes) - always creates fresh client
export function createServerClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// For backward compatibility - but this will only work at runtime
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});
