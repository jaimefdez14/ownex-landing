import { faqItems } from "../data/faq";
import { env } from "../lib/env";

/**
 * Datos estructurados: Organization y FAQPage.
 * Se generan desde la misma fuente que pinta el acordeon, asi que no pueden
 * desincronizarse del contenido visible.
 */
export function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Ownex",
      url: env.siteUrl,
      logo: `${env.siteUrl}/favicon.svg`,
      description:
        "Plataforma B2B de co-propiedad para marcas de consumo: estructuración legal, emisión de equity dirigida a la comunidad y gestión continua de accionistas.",
      areaServed: "ES",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
