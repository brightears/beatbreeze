// Client-side Supabase configuration
// Browser-safe client with auth helpers

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase public environment variables');
}

/**
 * Client-side Supabase client
 * Safe to use in browser - respects RLS policies
 */
export const supabase: SupabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

/**
 * Sign out
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Get current session
 */
export async function getSession() {
  return supabase.auth.getSession();
}

/**
 * Get current user
 */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
