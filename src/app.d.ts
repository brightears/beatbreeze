// See https://svelte.dev/docs/kit/types#app.d.ts
// Cloud Code type declarations

import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Error {
      code?: string;
      message: string;
    }

    interface Locals {
      supabase: SupabaseClient;
      safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
      session: Session | null;
      user: User | null;
      organizationId: string | null;
    }

    interface PageData {
      session: Session | null;
      user: User | null;
    }

    // interface PageState {}
    // interface Platform {}
  }

  // Environment variables (private - server only)
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      R2_ACCOUNT_ID: string;
      R2_ACCESS_KEY_ID: string;
      R2_SECRET_ACCESS_KEY: string;
      R2_BUCKET_NAME: string;
      R2_PUBLIC_URL: string;
      MQTT_BROKER_URL: string;
      MQTT_USERNAME: string;
      MQTT_PASSWORD: string;
      OPENAI_API_KEY?: string;
    }
  }
}

export {};
