/**
 * Circuito del lead (§8.5). Funcion serverless, formato Vercel (runtime edge).
 *
 * Un envio da de alta al lead como contacto en la audiencia de Mailchimp
 * indicada por MAILCHIMP_AUDIENCE_ID, con marca y mensaje en los merge fields
 * COMPANY y MMERGE7 (creados a mano en Mailchimp, ver README). El aviso interno
 * al equipo y el correo de confirmacion al lead NO los manda este archivo: se
 * configuran dentro de Mailchimp (Audience > Settings > Notifications, y un
 * Automation de bienvenida si se quiere algo mas elaborado que el generico).
 *
 * Ninguna clave vive en el cliente: todas las variables de este archivo se leen
 * del entorno del servidor y ninguna lleva el prefijo VITE_.
 *
 * Si se prefiere Formspree o Basin, basta con apuntar VITE_FORM_ENDPOINT a su URL
 * y este archivo deja de usarse.
 */

export const config = { runtime: "edge" };

type LeadPayload = {
  nombre?: string;
  apellido?: string;
  email?: string;
  marca?: string;
  mensaje?: string;
  referrer?: string;
  [key: string]: unknown;
};

const clean = (value: unknown, max = 2000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/**
 * Alta (o actualizacion silenciosa) del lead en la audiencia de Mailchimp.
 *
 * Usa el endpoint POST de alta directa en vez del PUT idempotente por hash MD5
 * del email: el runtime edge no trae las utilidades de hash de Node, y las del
 * navegador no ofrecen MD5, asi que calcular el subscriber_hash que pide el
 * PUT no es viable aqui sin anadir una libreria. El POST resuelve el caso normal
 * (lead nuevo) y, si la persona ya estaba en la audiencia, Mailchimp responde 400 "Member Exists":
 * se trata como exito, porque el contacto ya existe, que es justo lo que se
 * queria conseguir.
 */
async function upsertMailchimpMember(lead: {
  email: string;
  nombre: string;
  apellido: string;
  marca: string;
  mensaje: string;
}) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !serverPrefix || !audienceId) {
    throw new Error("Mailchimp sin configurar (falta API key, server prefix o audience id)");
  }

  const auth = `Basic ${btoa(`anystring:${apiKey}`)}`;

  const response = await fetch(
    `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: lead.email,
        status: "subscribed",
        merge_fields: {
          FNAME: lead.nombre,
          LNAME: lead.apellido,
          COMPANY: lead.marca,
          MMERGE7: lead.mensaje,
        },
      }),
    },
  );

  if (response.ok) return;

  const details = await response.json().catch(() => null);

  if (response.status === 400 && details?.title === "Member Exists") {
    return;
  }

  throw new Error(`Mailchimp respondio ${response.status}: ${details?.detail ?? await response.text()}`);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo no válido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const nombre = clean(body.nombre, 120);
  const apellido = clean(body.apellido, 120);
  const email = clean(body.email, 200);
  const marca = clean(body.marca, 160);
  const mensaje = clean(body.mensaje);

  if (
    nombre.length < 2 ||
    apellido.length < 2 ||
    marca.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  ) {
    return new Response(JSON.stringify({ error: "Datos incompletos" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const lead = {
    nombre,
    apellido,
    email,
    marca,
    mensaje,
    referrer: clean(body.referrer, 300),
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    utm_content: clean(body.utm_content, 120),
    utm_term: clean(body.utm_term, 120),
    fecha: new Date().toISOString(),
  };

  try {
    await upsertMailchimpMember({ email, nombre, apellido, marca, mensaje });

    // Registro adicional opcional. Un lead nunca puede vivir solo dentro de
    // una bandeja de entrada, asi que si hay un webhook configurado (hoja de
    // calculo, Notion, etc.) se le manda una copia ademas de a Mailchimp.
    const registry = process.env.LEAD_REGISTRY_WEBHOOK;
    if (registry) {
      await fetch(registry, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, estado: "nuevo" }),
      }).catch(() => undefined);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fallo al procesar el lead", error);
    return new Response(JSON.stringify({ error: "No se ha podido procesar la solicitud" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
