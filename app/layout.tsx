import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UI Components Playground',
  description: 'Interactive playground for testing and documenting UI components',
  keywords: ['ui', 'components', 'playground', 'react', 'typescript'],
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? process.env.CI_COMMIT_REF_SLUG && process.env.CI_COMMIT_REF_SLUG !== 'main'
      ? `https://ui-components-5218c2.gitlab.io/${process.env.CI_COMMIT_REF_SLUG}`
      : 'https://miguel-lourenco-main.gitlab.io/ui-components'
    : 'http://localhost:3000'
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        
        {/* Monaco Editor optimization */}
        <link rel="preload" as="script" href="/_next/static/chunks/monaco-editor.js" />
        
        {/* Cache control for better performance */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
        
        {/* Viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Prevent render blocking */}
        <meta name="color-scheme" content="light" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
} 