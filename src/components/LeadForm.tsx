import { useEffect, useRef, useState } from "react";
import { ArrowRight, Plus, Send } from "lucide-react";
import { Button } from "./ui/Button";
import { Field, TextareaField } from "./ui/Field";
import { env, contactEmail, hasContactEmail } from "../lib/env";
import { track, sourceProperties } from "../lib/analytics";
import { useCopy, useLocale, type Localized } from "../i18n/locale";
import { LEGAL } from "../i18n/routes";

/**
 * Formulario de contacto.
 *
 * El del proyecto de Lovable no enviaba nada: su `handleSubmit` hacia
 * `setSubmitted(true)` y punto. Sin destino, sin validacion propia, sin estado de
 * error, sin proteccion contra robots y sin correo de confirmacion. Un lead
 * cualificado rellenaba el formulario, veia "Mensaje enviado" y se perdia.
 *
 * Aqui se conserva su aspecto exacto y se le conecta el circuito real que ya
 * funcionaba en la v1: POST al endpoint configurable, campo trampa, descarte de
 * envios instantaneos, validacion con mensajes propios, estado de fallo y aviso
 * interno mas correo de confirmacion desde `api/lead.ts`.
 *
 * Se conserva ademas el campo "Compañía", que el original no tenia: es el dato
 * que cualifica al lead y el que usan el asunto del aviso interno y el correo
 * de confirmacion. El mensaje, en cambio, es opcional: no aporta lo mismo a
 * todo el mundo y no debe ser una barrera para enviar el formulario.
 */

type FieldName = "nombre" | "apellido" | "email" | "marca" | "mensaje";
type Errors = Partial<Record<FieldName, string>>;

/*
  Un mensaje por campo, y cada uno dice PARA QUE sirve el dato.

  Hasta el 26/08/2026 los cuatro campos obligatorios compartian una unica
  constante, "Este campo es obligatorio.", asi que enviar el formulario vacio
  soltaba cuatro avisos identicos que no decian nada. Y ocurre en el punto de
  mayor friccion del embudo: alguien que acaba de intentar convertir y ha
  fallado. Un error que explica por que se pide el dato convierte mejor que uno
  que solo senala la casilla.
*/
/* Espacio duro: el §4.1 lo exige antes de € y % en el copy espanol. */
const NB = " ";

type Copy = {
  missing: Record<Exclude<FieldName, "mensaje" | "apellido">, string>;
  emailInvalid: string;
  tooLong: string;
  network: string;
  sentTitle: string;
  sentBody: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  details: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  reply: string;
  consentBefore: string;
  consentLink: string;
};

// TODO(jaime): sin correo de contacto confirmado no se puede publicar la direccion
// de respaldo, asi que el mensaje de fallo cae en su version corta.
const COPY: Localized<Copy> = {
  es: {
    missing: {
      nombre: "Dinos tu nombre y apellido para la llamada.",
      email: "Necesitamos tu correo: ahí te confirmamos la cita.",
      marca: "¿De qué marca hablamos?",
    },
    emailInvalid: "Ese correo no parece válido. Revísalo y volvemos a intentarlo.",
    tooLong: "El mensaje admite 2000 caracteres como máximo.",
    network: hasContactEmail
      ? `No se ha podido enviar el formulario. Puedes reintentarlo o escribir directamente a ${contactEmail}.`
      : "No se ha podido enviar el formulario. Puedes reintentarlo en unos minutos.",
    sentTitle: "Mensaje enviado.",
    sentBody: "Te contactaremos en breve.",
    nameLabel: "Nombre y apellido",
    namePlaceholder: "Tu nombre y apellido",
    emailLabel: "Email",
    emailPlaceholder: "tu@empresa.com",
    companyLabel: "Compañía",
    companyPlaceholder: "Nombre de tu compañía",
    details: "Añadir detalles sobre tu compañía (opcional)",
    messageLabel: "Sector, tamaño de tu comunidad y ronda que valoras",
    messagePlaceholder: `Marca de moda, 12.000 clientes recurrentes, valorando 300.000${NB}€`,
    submit: "Agendar la llamada",
    reply: "Te respondemos en 24 horas laborables. Sin compromiso y sin coste.",
    consentBefore: "Al enviar aceptas que tratemos tus datos para responderte. Consulta la",
    consentLink: "política de privacidad",
  },
  en: {
    /*
      Cada error dice PARA QUE sirve el dato, igual que en espanol: es la correccion
      del 26/08 y vale en los dos idiomas, porque ocurre en el punto de mayor friccion
      del embudo (alguien que acaba de intentar convertir y ha fallado).
    */
    missing: {
      nombre: "Tell us your first and last name for the call.",
      email: "We need your email: that's where we confirm the call.",
      marca: "Which brand are we talking about?",
    },
    emailInvalid: "That email doesn't look right. Check it and we'll try again.",
    tooLong: "The message takes 2,000 characters at most.",
    network: hasContactEmail
      ? `The form couldn't be sent. You can try again or write directly to ${contactEmail}.`
      : "The form couldn't be sent. You can try again in a few minutes.",
    sentTitle: "Message sent.",
    sentBody: "We'll be in touch shortly.",
    nameLabel: "Full name",
    namePlaceholder: "Your first and last name",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    companyLabel: "Company",
    companyPlaceholder: "Your company name",
    details: "Add details about your company (optional)",
    messageLabel: "Sector, size of your community and the round you're considering",
    messagePlaceholder: "Fashion brand, 12,000 recurring customers, considering €300,000",
    submit: "Book the call",
    reply: "We reply within 24 working hours. No commitment and no cost.",
    consentBefore: "By submitting you agree that we process your data to reply to you. See the",
    consentLink: "privacy policy",
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Record<FieldName, string>, copy: Copy, field?: FieldName): Errors {
  const all: Errors = {};

  if (values.nombre.trim().length < 2) all.nombre = copy.missing.nombre;
  if (values.email.trim().length === 0) all.email = copy.missing.email;
  else if (!emailPattern.test(values.email.trim())) all.email = copy.emailInvalid;
  if (values.marca.trim().length < 2) all.marca = copy.missing.marca;
  if (values.mensaje.length > 2000) all.mensaje = copy.tooLong;

  if (!field) return all;
  return all[field] ? { [field]: all[field] } : {};
}

export function LeadForm() {
  const t = useCopy(COPY);
  const legal = useCopy(LEGAL);
  const locale = useLocale();
  const [values, setValues] = useState<Record<FieldName, string>>({
    nombre: "",
    apellido: "",
    email: "",
    marca: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const renderedAt = useRef(0);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

  const onFirstFocus = () => {
    if (started) return;
    setStarted(true);
    track("form_start");
  };

  const setValue = (field: FieldName) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const onBlurField = (field: FieldName) => () => {
    setErrors((current) => ({ ...current, ...validate(values, t, field) }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const form = event.currentTarget;
    const honeypot = (form.elements.namedItem("_gotcha") as HTMLInputElement | null)?.value ?? "";

    if (honeypot.trim().length > 0) return;
    if (Date.now() - renderedAt.current < 2000) return;

    const found = validate(values, t);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const firstField = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`#${firstField}`)?.focus();
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch(env.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nombre: values.nombre.trim().split(/\s+/)[0],
          apellido: values.nombre.trim().split(/\s+/).slice(1).join(" "),
          email: values.email.trim(),
          marca: values.marca.trim(),
          mensaje: values.mensaje.trim(),
          /*
            EL IDIOMA VIAJA CON EL LEAD - 16/09/2026. No es un dato de analitica: es
            en que idioma hay que CONTESTARLE. Entra como etiqueta en la audiencia
            (ver `api/lead.ts`), asi que una campana puede segmentarse por idioma sin
            tocar nada mas.
          */
          idioma: locale,
          ...sourceProperties(),
        }),
      });

      if (!response.ok) throw new Error(String(response.status));

      setStatus("sent");
      track("form_submit_success");
    } catch (error) {
      setStatus("idle");
      setSubmitError(t.network);
      track("form_submit_error", { reason: error instanceof Error ? error.message : "desconocido" });
    }
  };

  if (status === "sent") {
    return (
      <div ref={successRef} role="status" tabIndex={-1} className="glass-card p-10 text-center">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-accent-soft">
          <Send aria-hidden="true" size={20} className="text-accent-ink" />
        </span>
        <h3 className="mb-2 text-title text-foreground">{t.sentTitle}</h3>
        <p className="text-body text-text-secondary">{t.sentBody}</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} onFocus={onFirstFocus} className="glass-card space-y-5 p-8 md:p-10">
      {/*
        UN CAMPO, NO DOS - 26/08/2026. "Nombre" y "Apellido" eran dos casillas
        separadas, y con ellas el formulario pedia cinco datos para agendar una
        llamada. Cada campo de un formulario cuesta conversion, y separar el
        nombre no aportaba nada: al enviar se parte por el primer espacio, que es
        exactamente lo que hacia la persona al rellenarlo.

        `autoComplete="name"` en vez de `given-name`/`family-name`: el navegador
        rellena el nombre completo de una vez.
      */}
      <Field
        id="nombre"
        label={t.nameLabel}
        placeholder={t.namePlaceholder}
        autoComplete="name"
        maxLength={160}
        value={values.nombre}
        onChange={setValue("nombre")}
        onBlur={onBlurField("nombre")}
        error={errors.nombre}
      />

      <Field
        id="email"
        label={t.emailLabel}
        type="email"
        inputMode="email"
        placeholder={t.emailPlaceholder}
        autoComplete="email"
        maxLength={255}
        value={values.email}
        onChange={setValue("email")}
        onBlur={onBlurField("email")}
        error={errors.email}
      />

      <Field
        id="marca"
        label={t.companyLabel}
        placeholder={t.companyPlaceholder}
        autoComplete="organization"
        maxLength={160}
        value={values.marca}
        onChange={setValue("marca")}
        onBlur={onBlurField("marca")}
        error={errors.marca}
      />

      {/*
        El mensaje pasa a estar plegado. Es opcional y casi nadie lo rellena,
        pero ocupaba cuatro filas en medio del camino y hacia que el formulario
        pareciera largo antes de empezarlo. Quien tenga algo que contar lo abre;
        el resto ve tres campos y un boton.
      */}
      <details className="group">
        <summary className="inline-flex min-h-touch cursor-pointer list-none items-center gap-2 text-caption text-text-secondary transition-colors hover:text-foreground">
          <Plus
            aria-hidden="true"
            size={14}
            className="text-accent-ink transition-transform group-open:rotate-45 motion-reduce:transition-none"
          />
          {t.details}
        </summary>
        <div className="mt-4">
          <TextareaField
            id="mensaje"
            label={t.messageLabel}
            optional
            rows={4}
            maxLength={2000}
            placeholder={t.messagePlaceholder}
            value={values.mensaje}
            onChange={setValue("mensaje")}
            onBlur={onBlurField("mensaje")}
            error={errors.mensaje}
          />
        </div>
      </details>

      {/* Campo trampa. Invisible para una persona, tentador para un robot. */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[9999px]"
      />

      {/*
        "Agendar la llamada", no "Obtener más información". Todo lo que lleva
        hasta aqui (la barra de navegacion, el hero, la seccion intermedia, la
        barra fija de movil y el propio titular de esta seccion) promete una
        llamada de 30 minutos; el boton que cierra ese recorrido prometia otra
        cosa distinta y mas vaga. Un unico verbo de principio a fin.
      */}
      <Button type="submit" size="lg" fullWidth loading={status === "sending"}>
        {t.submit}
        <ArrowRight aria-hidden="true" size={16} />
      </Button>

      <p className="text-caption text-text-tertiary">{t.reply}</p>

      {/*
        Deber de informacion en el punto de recogida (RGPD art. 13). Faltaba: el
        formulario pedia nombre, correo y compania sin decir en ninguna parte
        quien los trata ni para que, y la politica solo se alcanzaba desde el
        pie. El enlace va aqui, pegado al boton que envia, que es donde se
        presta el consentimiento.
      */}
      <p className="text-caption text-text-tertiary">
        {t.consentBefore}{" "}
        <a
          href={legal.privacy}
          className="underline underline-offset-2 hover:text-text-secondary"
        >
          {t.consentLink}
        </a>
        .
      </p>

      {submitError ? (
        <p role="alert" className="text-caption text-danger">
          {submitError}
        </p>
      ) : null}
    </form>
  );
}
