import Contact from "@/components/Contact";
import Content from "@/components/Content";
import PricingHero from "@/components/hero/PricingHero";
import Testimonials from "@/components/Testimonials";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center -mt-16 w-full h-full">
      <PricingHero />
      <Content />
      <Testimonials />
      <Contact />
    </div>
  );
};

export default page;
