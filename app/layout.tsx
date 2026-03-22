import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
// import PageTransitionLayout from "@/components/PageTransitionLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://talktune.pro"),
  title: {
    default: "TalkTune - AI Voiceover Generator & Text to Speech",
    template: "%s | TalkTune",
  },
  description: "Effortlessly create professional AI-powered voiceovers in seconds. Nigerian accents, multiple voices, instant audio generation.",
  keywords: ["AI voiceover", "text to speech", "Nigerian voice", "audio generator", "TalkTune", "voice over"],
  openGraph: {
    type: "website",
    siteName: "TalkTune",
    title: "TalkTune - AI Voiceover Generator & Text to Speech",
    description: "Effortlessly create professional AI-powered voiceovers in seconds.",
    url: "https://talktune.pro",
    images: [{ url: "/images/banner.jpg", width: 1200, height: 630, alt: "TalkTune AI Voiceover Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TalkTune - AI Voiceover Generator & Text to Speech",
    description: "Effortlessly create professional AI-powered voiceovers in seconds.",
    images: ["/images/banner.jpg"],
  },
  robots: { index: true, follow: true },
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
        <SessionProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
