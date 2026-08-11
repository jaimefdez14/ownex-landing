/**
 * Lectura unica de las variables de entorno (§15).
 * Se lee de forma segura tambien durante el prerenderizado, donde no hay navegador.
 */

const raw = import.meta.env;

const read = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export const env = {
  formEndpoint: read(raw.VITE_FORM_ENDPOINT) || "/api/lead",
  posthogKey: read(raw.VITE_POSTHOG_KEY),
  posthogHost: read(raw.VITE_POSTHOG_HOST) || "https://eu.posthog.com",
  calendarUrl: read(raw.VITE_CALENDAR_URL),
  contactEmail: read(raw.VITE_CONTACT_EMAIL),
  linkedinUrl: read(raw.VITE_LINKEDIN_URL),
  siteUrl: read(raw.VITE_SITE_URL) || "https://ownex.co",
};

/** Correo mostrado en la interfaz. Sin valor confirmado, no se inventa ninguno (§12.5). */
export const contactEmail = env.contactEmail;
export const hasContactEmail = contactEmail.length > 0;
