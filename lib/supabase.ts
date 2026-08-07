import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (or EXPO_PUBLIC_SUPABASE_KEY) are required.",
  );
}

export function createClerkSupabaseClient(
  getToken: (options?: any) => Promise<string | null>,
) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    async accessToken() {
      try {
        const token = await getToken({ template: "supabase" });
        if (token) return token;
      } catch {
        // Fallback to default getToken if 'supabase' JWT template is not configured in Clerk
      }
      return (await getToken().catch(() => null)) ?? null;
    },
  });
}

