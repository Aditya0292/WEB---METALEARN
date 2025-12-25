import "@/styles/globals.css";
import "@/styles/animations.css";
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isLanding = router.pathname === '/';

  // Landing page might want a different layout (e.g. no sidebar)
  // But for now, let's wrap everything in Layout except maybe Landing?
  // Use a simple check.

  return (
    <div className={inter.className}>
      {isLanding ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </div>
  );
}
