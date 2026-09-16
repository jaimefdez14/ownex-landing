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
import { ConsentBanner } from "./components/ConsentBanner";
import { JsonLd } from "./components/JsonLd";
import { Analytics } from "@vercel/analytics/react";
import { useHashLanding } from "./lib/useHashLanding";
import { useReveal } from "./lib/useReveal";
import { useSectionView } from "./lib/useSectionView";
import { useSpotlight } from "./lib/useSpotlight";
import { initAnalytics, track, sourceProperties } from "./lib/analytics";
import { LocaleProvider, useCopy, type Locale } from "./i18n/locale";

/**
 * La pagina entera, en el idioma que dicte la URL (ver `i18n/locale.tsx`). El
 * proveedor va por fuera de todo lo demas para que cualquier componente pueda leer
 * el idioma sin recibirlo por props.
 */
export function App({ locale }: { locale: Locale }) {
  return (
    <LocaleProvider locale={locale}>
      <Page />
    </LocaleProvider>
  );
}

const SKIP = { es: "Saltar al contenido", en: "Skip to content" };

function Page() {
  const skip = useCopy(SKIP);
  useReveal();
  useSectionView();
  useSpotlight();
  useHashLanding();

  /*
    `initAnalytics` ya no arranca nada por si mismo: lee el consentimiento y se
    queda escuchando (ver `lib/analytics.ts`). Si no hay un si guardado, esta
    llamada no dispara una sola peticion de red, y `track` descarta el evento en
    lugar de encolarlo. En cuanto alguien acepta en el banner, PostHog se carga y
    manda su propia `$pageview`, que es la que sostiene el calculo de duracion;
    `landing_view` se conserva porque lleva los parametros de campana, que el
    `$pageview` automatico no adjunta.
  */
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:inline-flex focus:min-h-touch focus:items-center focus:rounded-md focus:bg-emerald-400 focus:px-6 focus:text-label focus:text-on-accent"
      >
        {skip}
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
      <ConsentBanner />
      <JsonLd />
      {/*
        ANALITICA DE VERCEL - va FUERA del consentimiento, a proposito.

        Por que existe teniendo PostHog: PostHog no arranca hasta que alguien
        acepta en el banner, o sea que la mayoria del trafico no se cuenta en
        ninguna parte. Esto da el recuento base de visitas y navegaciones de
        TODO el mundo, que es justo lo que faltaba. No sustituye a PostHog: no
        graba recorrido, no lleva parametros de campana propios y no sabe nada
        de embudos.

        Por que no pasa por el banner: no instala ninguna cookie ni escribe en
        el almacenamiento del navegador - comprobado sobre el script servido, no
        sobre la documentacion. El banner promete que "si no aceptas, no se
        instala ninguna", y eso sigue siendo cierto palabra por palabra.

        DONDE ESTA EL LIMITE, para que quede escrito: la defensa de arriba se
        apoya en que esto es agregado y sin cookies. Si algun dia se le anade
        `track()` con propiedades de una persona, o se sube a un plan que
        identifique visitantes, deja de valer y hay que meterlo bajo el
        consentimiento como PostHog. Ver `lib/consent.ts`.
      */}
      <Analytics />
    </>
  );
}
