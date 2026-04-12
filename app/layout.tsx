import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair_display = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'അൽ ജലാൽ Online Magazine',
  description: 'JASIA Students Union of Jamia Jalaliyya Mundakkulam - A platform for student voices and creative excellence',
  openGraph: {
    title: 'അൽ ജലാൽ Online Magazine',
    description: 'JASIA Students Union of Jamia Jalaliyya Mundakkulam - Celebrating Student Voices & Creative Excellence',
    type: 'website',
    locale: 'en_US',
    siteName: 'അൽ ജലാൽ Magazine',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'അൽ ജലാൽ Online Magazine',
    description: 'JASIA Students Union of Jamia Jalaliyya Mundakkulam - Celebrating Student Voices & Creative Excellence',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair_display.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
