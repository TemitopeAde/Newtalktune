import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest articles on AI voiceovers, audio production, and the future of text-to-speech technology.",
  openGraph: {
    url: "https://talktune.pro/blogs",
  },
  alternates: { canonical: "https://talktune.pro/blogs" },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
