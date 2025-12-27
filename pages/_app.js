import "@/styles/globals.css";
import "@/styles/animations.css";
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      // Redirect if not logged in (Simple check)
      if (!session && !['/auth', '/'].includes(router.pathname)) {
        router.push('/auth');
      }
    });

    // 2. Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !['/auth', '/'].includes(router.pathname)) {
        router.push('/auth');
      }
      if (session && router.pathname === '/auth') {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router.pathname]);

  const isAuthPage = router.pathname === '/auth';
  const isLanding = router.pathname === '/';

  if (loading) return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className={inter.className}>
      {isAuthPage || isLanding ? (
        <Component {...pageProps} session={session} />
      ) : (
        <Layout user={session?.user}>
          <Component {...pageProps} session={session} />
        </Layout>
      )}
    </div>
  );
}
