import Audience from "@/components/Audience";
import Contact from "@/components/Contact";
import Content from "@/components/Content";
import FeatureSection from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Voiceover Generator & Text to Speech",
  description: "Create professional AI-powered voiceovers with Nigerian accents and multiple voices. Fast, easy, and high quality.",
  openGraph: {
    title: "TalkTune - AI Voiceover Generator & Text to Speech",
    description: "Create professional AI-powered voiceovers instantly.",
    url: "https://talktune.pro",
  },
  alternates: { canonical: "https://talktune.pro" },
};

const Main = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <Hero />
      <Audience />
      <FeatureSection />
      {/* <Content /> */}
      <Testimonials />
      <Contact />
    </div>
  );
};

export default Main;
