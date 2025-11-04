import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Charisma Pro - Развивайте социальные навыки",
  description: "Duolingo для социальных навыков и харизмы. Изучайте через геймифицированные упражнения, симуляции диалогов и реальные миссии.",
  keywords: ["харизма", "социальные навыки", "общение", "развитие личности", "игровое обучение"],
  authors: [{ name: "Charisma Pro Team" }],
  creator: "Charisma Pro",
  publisher: "Charisma Pro",
  robots: "index, follow",
  icons: {
    // favicon.ico автоматически обрабатывается из src/app/favicon.ico
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Charisma Pro - Развивайте социальные навыки",
    description: "Duolingo для социальных навыков и харизмы. Изучайте через геймифицированные упражнения.",
    type: "website",
    locale: "ru_RU",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Charisma Pro Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Charisma Pro - Развивайте социальные навыки",
    description: "Duolingo для социальных навыков и харизмы. Изучайте через геймифицированные упражнения.",
    images: ['/web-app-manifest-512x512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Charisma Pro',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NavigationProgress />
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
