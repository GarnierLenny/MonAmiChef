// src/pages/LandingPage.tsx
import { lazy, Suspense } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import SEOHead from "@/components/SEOHead";

export default function LandingPage() {
  return (
    <div className="bg-white overflow-x-hidden">
      <SEOHead
        title="Mon Ami Chef - AI-Powered Personal Chef & Meal Planning"
        description="Transform your cooking with AI. Get personalized recipes, weekly meal plans, and smart grocery lists in seconds. Your AI sous chef is ready to help."
        keywords="AI chef, meal planning, recipe generator, grocery list, cooking assistant, AI cooking, meal prep, personalized recipes"
      />

      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeatureGrid />
      <TestimonialSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
