import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the TalkTune team. Send us a message and we'll get back to you.",
  openGraph: {
    url: "https://talktune.pro/contact",
  },
  alternates: { canonical: "https://talktune.pro/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
