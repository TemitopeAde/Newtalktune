import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col h-full w-full">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
};

export default MainLayout;
