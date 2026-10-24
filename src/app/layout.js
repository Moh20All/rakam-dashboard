import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex-mono', display: 'swap' });

export const metadata = {
  title: { default: 'Warshati — ورشتي', template: '%s · Warshati' },
  description: 'Phone repair & store management for Algerian workshops.',
  icons: { icon: '/favicon.svg' },
};

export const viewport = {
  themeColor: '#0c0f1a',
};

// Applies the saved theme before first paint, so dark mode does not flash white
const themeScript = `try{var t=localStorage.getItem('warshati-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
