import localFont from 'next/font/local';
import './globals.css';

// IBM Plex (SIL Open Font License), bundled with the site like in the desktop app
const plexSans = localFont({
  src: [
    { path: './fonts/ibm-plex-sans-latin-400-normal.woff2', weight: '400' },
    { path: './fonts/ibm-plex-sans-latin-500-normal.woff2', weight: '500' },
    { path: './fonts/ibm-plex-sans-latin-600-normal.woff2', weight: '600' },
    { path: './fonts/ibm-plex-sans-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-plex-sans',
  display: 'swap',
});
const plexArabic = localFont({
  src: [
    { path: './fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2', weight: '400' },
    { path: './fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2', weight: '500' },
    { path: './fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2', weight: '600' },
    { path: './fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-plex-arabic',
  display: 'swap',
});
const plexMono = localFont({
  src: [
    { path: './fonts/ibm-plex-mono-latin-400-normal.woff2', weight: '400' },
    { path: './fonts/ibm-plex-mono-latin-500-normal.woff2', weight: '500' },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata = {
  title: { default: 'Warshati — ورشتي', template: '%s · Warshati' },
  description: 'Phone repair & store management for Algerian workshops.',
  icons: { icon: '/favicon.svg' },
};

export const viewport = {
  themeColor: '#1A1F1D',
};

// Applies the saved theme before first paint, so dark mode does not flash white
const themeScript = `try{var t=localStorage.getItem('warshati-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexArabic.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
