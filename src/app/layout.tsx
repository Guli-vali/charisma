import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Charisma Pro - Развивайте социальные навыки",
  description: "Duolingo для социальных навыков и харизмы. Изучайте через геймифицированные упражнения, симуляции диалогов и реальные миссии.",
  keywords: ["харизма", "социальные навыки", "общение", "развитие личности", "игровое обучение"],
  authors: [{ name: "Charisma Pro Team" }],
  creator: "Charisma Pro",
  publisher: "Charisma Pro",
  robots: "index, follow",
  openGraph: {
    title: "Charisma Pro - Развивайте социальные навыки",
    description: "Duolingo для социальных навыков и харизмы. Изучайте через геймифицированные упражнения.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
