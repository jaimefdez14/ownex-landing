import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ScrollProgress } from "./components/ScrollProgress";
import { HeroSection } from "./components/HeroSection";
import { ProblemSection } from "./components/ProblemSection";
import { PrincipleSection } from "./components/PrincipleSection";
import { SolutionSection } from "./components/SolutionSection";
import { FrameworkSection } from "./components/FrameworkSection";
import { CalculatorSection } from "./components/CalculatorSection";
import { RegulationSection } from "./components/RegulationSection";
import { ExamplesSection } from "./components/ExamplesSection";
import { FAQSection } from "./components/FAQSection";
import { FooterCTA } from "./components/FooterCTA";
import { MobileCtaBar } from "./components/MobileCtaBar";
import { JsonLd } from "./components/JsonLd";
import { useReveal } from "./lib/useReveal";
import { useSectionView } from "./lib/useSectionView";
import { useSpotlight } from "./lib/useSpotlight";
import { initAnalytics, track, sourceProperties } from "./lib/analytics";

export function App() {
  useReveal();
  useSectionView();
  useSpotlight();

  useEffect(() => {
    initAnalytics();
    track("landing_view", sourceProperties());
  }, []);

  return (
    <>
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:inline-flex focus:min-h-touch focus:items-center focus:rounded-md focus:bg-emerald-400 focus:px-6 focus:text-label focus:text-background"
      >
        Saltar al contenido
      </a>

      <ScrollProgress />
      <Navbar />

      <main id="main">
        <HeroSection />
        <ProblemSection />
        <PrincipleSection />
        <SolutionSection />
        <FrameworkSection />
        <CalculatorSection />
        <RegulationSection />
        <ExamplesSection />
        <FAQSection />
      </main>

      <FooterCTA />
      <MobileCtaBar />
      <JsonLd />
    </>
  );
}
