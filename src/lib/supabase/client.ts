import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Allow app to start without Supabase in development
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing Supabase environment variables");
  }
}

export function createBrowserClient() {
  return createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
}
