import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Database features will not work.');
}

// Fallback to placeholder to prevent crash if env vars are missing
// Check for valid URL to prevent crash
const isValidUrl = (url) => url && url.startsWith('http') && !url.includes('YOUR_SUPABASE_URL_HERE');
const url = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
const key = supabaseAnonKey && !supabaseAnonKey.includes('YOUR_SUPABASE_KEY') ? supabaseAnonKey : 'placeholder-key';

if (!isValidUrl(supabaseUrl)) {
  console.warn('⚠️ Invalid or Missing Supabase URL. Using Mock/Placeholder mode.');
}

export const supabase = createClient(url, key);
