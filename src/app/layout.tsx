"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { ReactQueryClientProvider } from "./clientQuery"
import { Provider } from "react-redux"
import { useRef } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="p-8">{children}</div>
        </body>
      </html>
    </ReactQueryClientProvider>
  )
}
