import './globals.css'

export const metadata = {
  title: 'Wild Rift Tracker',
  description: 'Track your Wild Rift ADC rank progression and get AI coaching feedback.',
  manifest: '/manifest.json',
  themeColor: '#60a5fa',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WR Tracker',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        ` }} />
      </body>
    </html>
  )
}
