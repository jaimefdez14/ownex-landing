import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ScrollProgress } from "./components/ScrollProgress";
import { HeroSection } from "./components/HeroSection";
import { ProblemSection } from "./components/ProblemSection";
import { PrincipleSection } from "./components/PrincipleSection";
import { SolutionSection } from "./components/SolutionSection";
import { CalculatorSection } from "./components/CalculatorSection";
import { FrameworkSection } from "./components/FrameworkSection";
import { RegulationSection } from "./components/RegulationSection";
import { ExamplesSection } from "./components/ExamplesSection";
import { FAQSection } from "./components/FAQSection";
import { FooterCTA } from "./components/FooterCTA";
import { MobileCtaBar } from "./components/MobileCtaBar";
import { JsonLd } from "./components/JsonLd";
import { useReveal } from "./lib/useReveal";
import { useSectionView } from "./lib/useSectionView";
import { initAnalytics, track, sourceProperties } from "./lib/analytics";

export function App() {
  useReveal();
  useSectionView();

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
        {/*
          ORDEN REVISADO EL 26/08/2026, enfocado a conversion.

          La calculadora sube de la sexta posicion a la segunda. Es el unico
          elemento interactivo de la pagina y estaba a catorce pantallas de
          scroll del hero: quien llegaba a ella ya se habia convencido o ya se
          habia ido. Ahora lo primero que se puede HACER en el sitio, y no solo
          leer, esta a un scroll del titular, y el segundo boton del hero lleva
          directo ahi ("Calcular mi ronda").

          El coste de este cambio es que se calcula antes de saber como funciona
          el mecanismo. Se asume a proposito: un fundador no necesita entender el
          SPV para querer saber cuanto puede levantar, y esa cifra es justo el
          gancho que le hace leer el resto. La objecion "¿esto es legal?" la
          responde ya la fila de confianza del hero.

          NOTA: esto revierte el orden que Jaime pidio el 23-ago (fases antes que
          calculadora). Se cambia bajo su instruccion expresa de reenfocar la
          pagina a conversion; si prefiere el orden anterior, es intercambiar
          estas dos lineas.
        */}
        <CalculatorSection />
        <ProblemSection />
        <PrincipleSection />
        <SolutionSection />
        <FrameworkSection />
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
