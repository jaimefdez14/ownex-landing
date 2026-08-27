import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ScrollProgress } from "./components/ScrollProgress";
import { HeroSection } from "./components/HeroSection";
import { HeroMetrics } from "./components/HeroMetrics";
import { ProblemSection } from "./components/ProblemSection";
import { PrincipleSection } from "./components/PrincipleSection";
import { SolutionSection } from "./components/SolutionSection";
import { FrameworkSection } from "./components/FrameworkSection";
import { CalculatorSection } from "./components/CalculatorSection";
import { RegulationSection } from "./components/RegulationSection";
import { ExamplesSection } from "./components/ExamplesSection";
import { ResourcesSection } from "./components/ResourcesSection";
import { FAQSection } from "./components/FAQSection";
import { FooterCTA } from "./components/FooterCTA";
import { MobileCtaBar } from "./components/MobileCtaBar";
import { JsonLd } from "./components/JsonLd";
import { useHashLanding } from "./lib/useHashLanding";
import { useReveal } from "./lib/useReveal";
import { useSectionView } from "./lib/useSectionView";
import { useSpotlight } from "./lib/useSpotlight";
import { initAnalytics, track, sourceProperties } from "./lib/analytics";

export function App() {
  useReveal();
  useSectionView();
  useSpotlight();
  useHashLanding();

  useEffect(() => {
    initAnalytics();
    track("landing_view", sourceProperties());
  }, []);

  return (
    <>
      {/*
        El salto va a `#main`, no a `#hero`. El rotulo dice "Saltar al contenido"
        y `<main>` ES el contenido: `#hero` es solo su primera seccion, asi que
        saltar ahi dejaba fuera del salto el propio landmark. `tabIndex={-1}` en
        el destino es lo que hace que el foco aterrice de verdad ahi y el
        siguiente tabulador siga desde el contenido y no desde la barra otra vez.
      */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:inline-flex focus:min-h-touch focus:items-center focus:rounded-md focus:bg-emerald-400 focus:px-6 focus:text-label focus:text-background"
      >
        Saltar al contenido
      </a>

      <ScrollProgress />
      <Navbar />

      <main id="main" tabIndex={-1} className="outline-none">
        <HeroSection />
        <HeroMetrics />
        <ProblemSection />
        <PrincipleSection />
        <SolutionSection />
        <FrameworkSection />
        {/*
          La calculadora se queda DETRAS de "Cómo funciona", como pidio Jaime el
          23-ago. Hubo un intento el 26-ago de subirla a la segunda posicion por
          conversion (es el unico elemento interactivo de la pagina y estaba a
          catorce pantallas del titular); Jaime lo descarto y vuelve aqui. El
          segundo boton del hero sigue apuntando a esta seccion y sigue diciendo
          "Calcular mi ronda", que es mejor gancho que el "Ver cómo funciona" que
          decia antes: el ancla lleva igual de bien estando la seccion abajo.
        */}
        <CalculatorSection />
        <RegulationSection />
        <ExamplesSection />
        <ResourcesSection />
        <FAQSection />
      </main>

      <FooterCTA />
      <MobileCtaBar />
      <JsonLd />
    </>
  );
}
