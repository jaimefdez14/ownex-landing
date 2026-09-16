import { faqItems } from "../data/faq";
import { env } from "../lib/env";
import { useCopy, useLocale } from "../i18n/locale";
import { HOME } from "../i18n/routes";

/**
 * Datos estructurados: Organization y FAQPage.
 * Se generan desde la misma fuente que pinta el acordeon, asi que no pueden
 * desincronizarse del contenido visible.
 *
 * POR IDIOMA desde el 16/09/2026: cada version declara su `inLanguage` y su `url`, y
 * las preguntas salen de la lista del idioma que se esta pintando. La `Organization`
 * es la misma entidad en las dos (mismo `url` raiz, misma `areaServed`), asi que solo
 * cambia la descripcion.
 */

const ORG_DESCRIPTION = {
  es: "Plataforma B2B de co-propiedad para marcas de consumo: estructuración legal, emisión de equity dirigida a la comunidad y gestión continua de accionistas.",
  en: "B2B co-ownership platform for consumer brands: legal structuring, equity issuance aimed at the community and ongoing shareholder management.",
};

const LANGUAGE_TAG = { es: "es-ES", en: "en-GB" };

export function JsonLd() {
  const locale = useLocale();
  const items = useCopy(faqItems);
  const description = useCopy(ORG_DESCRIPTION);

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Ownex",
      url: env.siteUrl,
      logo: `${env.siteUrl}/favicon.svg`,
      description,
      areaServed: "ES",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: LANGUAGE_TAG[locale],
      url: `${env.siteUrl.replace(/\/$/, "")}${HOME[locale]}`,
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          // Una respuesta puede venir en varios parrafos; schema.org quiere un texto.
          text: Array.isArray(item.answer) ? item.answer.join(" ") : item.answer,
        },
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
