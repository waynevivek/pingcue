const PLACEHOLDER_SUPABASE_URLS = new Set(["your-project-ref.supabase.co"]);
const PLACEHOLDER_ANON_KEYS = new Set([
  "your-supabase-anon-key",
  "your-supabase-publishable-key",
]);
const PLACEHOLDER_SERVICE_KEYS = new Set(["your-supabase-service-role-key"]);

function isValidSupabaseUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (PLACEHOLDER_SUPABASE_URLS.has(parsed.hostname)) {
    return false;
  }

  if (parsed.protocol === "https:") {
    return Boolean(parsed.hostname);
  }

  return (
    parsed.protocol === "http:" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
  );
}

export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !anonKey) return null;
  if (!isValidSupabaseUrl(url)) return null;
  if (PLACEHOLDER_ANON_KEYS.has(anonKey)) return null;

  return { url, anonKey };
}

export function getSupabaseAdminEnv(): {
  url: string;
  serviceKey: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) return null;
  if (!isValidSupabaseUrl(url)) return null;
  if (PLACEHOLDER_SERVICE_KEYS.has(serviceKey)) return null;

  return { url, serviceKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}
