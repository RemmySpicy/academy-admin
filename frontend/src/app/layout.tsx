import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RealAuthProvider } from '@/features/authentication/hooks/useRealAuth'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Academy Admin',
  description: 'Academy Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <RealAuthProvider>
          {children}
          <Toaster />
        </RealAuthProvider>
      </body>
    </html>
  )
}