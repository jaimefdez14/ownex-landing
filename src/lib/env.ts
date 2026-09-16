/**
 * Lectura unica de las variables de entorno (§15).
 * Se lee de forma segura tambien durante el prerenderizado, donde no hay navegador.
 */

const raw = import.meta.env;

const read = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export const env = {
  formEndpoint: read(raw.VITE_FORM_ENDPOINT) || "/api/lead",
  posthogKey: read(raw.VITE_POSTHOG_KEY),
  /* Host de INGESTA de la nube europea, no el del panel (`eu.posthog.com`). */
  posthogHost: read(raw.VITE_POSTHOG_HOST) || "https://eu.i.posthog.com",
  /*
    Google Analytics 4 (16/09/2026). El identificador de medicion es publico: va
    en el HTML de cualquier sitio que use GA. Se deja con valor por defecto para
    que funcione sin tocar Vercel, y vaciar la variable no lo apaga (usa "off").
  */
  gaId: read(raw.VITE_GA_ID) === "off" ? "" : read(raw.VITE_GA_ID) || "G-GC3B6M7C7S",
  calendarUrl: read(raw.VITE_CALENDAR_URL),
  contactEmail: read(raw.VITE_CONTACT_EMAIL),
  linkedinUrl: read(raw.VITE_LINKEDIN_URL),
  siteUrl: read(raw.VITE_SITE_URL) || "https://ownex.co",
};

/** Correo mostrado en la interfaz. Sin valor confirmado, no se inventa ninguno (§12.5). */
/** Hay alguna herramienta que pida consentimiento. Sin ninguna, no sale el banner. */
export const hasConsentedAnalytics = Boolean(env.posthogKey || env.gaId);

export const contactEmail = env.contactEmail;
export const hasContactEmail = contactEmail.length > 0;
