import Contact from "@/components/Contact";
import Content from "@/components/Content";
import Footer from "@/components/Footer";
import PricingHero from "@/components/hero/PricingHero";
import Testimonials from "@/components/Testimonials";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Affordable AI voiceover plans for individuals, creators, and businesses. Start for free.",
  openGraph: {
    url: "https://talktune.pro/pricing",
  },
  alternates: { canonical: "https://talktune.pro/pricing" },
};

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center -mt-16 w-full h-full">
      <PricingHero />
      <Content />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default page;
