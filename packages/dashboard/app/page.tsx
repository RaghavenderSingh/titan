"use client";

import Footer from "@/components/landing/Footer";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { CallToAction } from "@/components/landing/CallToAction";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-x-hidden">
      <LandingNavbar />
      <main className="relative z-10">
        <Hero />
        <Stats />
        <Features />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
