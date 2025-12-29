// Supabase Client Configuration
// Server-side clients with proper RLS handling

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Public Supabase client - respects RLS policies
 * Use for authenticated user requests
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

/**
 * Admin Supabase client - bypasses RLS
 * Use ONLY for:
 * - Cron jobs
 * - Admin operations
 * - Cross-org analytics
 * - Migrations
 *
 * NEVER expose this client to the frontend
 */
export const supabaseAdmin: SupabaseClient = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

/**
 * Create a Supabase client with a user's access token
 * This ensures RLS policies apply to the correct user
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Get the current user's organization ID from their JWT
 * Used for RLS policies
 */
export async function getUserOrgId(client: SupabaseClient): Promise<string | null> {
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data } = await client.from('users').select('organization_id').eq('supabase_user_id', user.id).single();

  return data?.organization_id ?? null;
}
