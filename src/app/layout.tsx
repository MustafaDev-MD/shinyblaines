import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PokedexProvider } from "@/contexts/PokedexContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Shiny Blaines - Pokemon Trading & Creation",
   description: "Create custom Pokemon, trade with others, and get exclusive shiny legendaries",
   icons: {
     icon: '/favicon.ico',
     shortcut: '/favicon.ico',
     apple: '/favicon.ico',
   }
 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <PokedexProvider>
              {children}
            </PokedexProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
