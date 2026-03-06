import './globals.css'

export const metadata = {
  title: 'Wild Rift Tracker & Coach',
  description: 'Track your Wild Rift rank progression and get coaching using OpenAI Vision.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen p-4 md:p-8">
        {children}
      </body>
    </html>
  )
}
