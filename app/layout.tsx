import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets:['latin'],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets:['latin'],
  variable: "--font-playfair", 
})


export const metadata: Metadata = {
  title: {
    template:`%s | Bornomala`,
    default: 'Bornomala'
  },
  description: `Learn French for Bangladeshi students`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-inter antialiased`}
      >
        <ThemeProvider attribute='class' defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
