import './globals.css';

export const metadata = {
  title: 'Wild Rift Tracker',
  description: 'Track your Wild Rift rank progression and get AI coaching insights for bot lane.',
  manifest: '/manifest.json',
  themeColor: '#0b1220',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Wild Rift Tracker',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/wr-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/wr-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
