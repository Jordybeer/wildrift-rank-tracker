import './globals.css'

export const metadata = {
  title: 'Wild Rift Tracker',
  description: 'Track your Wild Rift ADC rank progression and get AI coaching insights.',
  manifest: '/manifest.json',
  themeColor: '#60a5fa',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WR Tracker',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
