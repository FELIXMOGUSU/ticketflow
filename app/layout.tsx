import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TicketFlow — Events & Ticketing',
  description: 'Discover, create, and attend the best events. Get your tickets instantly.',
  keywords: 'events, tickets, ticketing, concerts, sports, conferences',
  openGraph: {
    title: 'TicketFlow — Events & Ticketing',
    description: 'Discover, create, and attend the best events.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy-900 text-white antialiased font-body">
        {children}
      </body>
    </html>
  )
}
