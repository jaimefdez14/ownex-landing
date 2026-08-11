import { useEffect, useRef, useState } from "react";
import { ArrowRight, Send } from "lucide-react";
import { Button } from "./ui/Button";
import { Field, TextareaField } from "./ui/Field";
import { env, contactEmail, hasContactEmail } from "../lib/env";
import { track, sourceProperties } from "../lib/analytics";

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

const REQUIRED = "Este campo es obligatorio.";
const EMAIL_INVALID = "La dirección de correo no parece válida.";

// TODO(jaime): sin correo de contacto confirmado no se puede publicar la direccion
// de respaldo, asi que el mensaje de fallo cae en su version corta.
const NETWORK_ERROR = hasContactEmail
  ? `No se ha podido enviar el formulario. Puedes reintentarlo o escribir directamente a ${contactEmail}.`
  : "No se ha podido enviar el formulario. Puedes reintentarlo en unos minutos.";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Record<FieldName, string>, field?: FieldName): Errors {
  const all: Errors = {};

  if (values.nombre.trim().length < 2) all.nombre = REQUIRED;
  if (values.apellido.trim().length < 2) all.apellido = REQUIRED;
  if (values.email.trim().length === 0) all.email = REQUIRED;
  else if (!emailPattern.test(values.email.trim())) all.email = EMAIL_INVALID;
  if (values.marca.trim().length < 2) all.marca = REQUIRED;
  if (values.mensaje.length > 2000) all.mensaje = "El mensaje admite 2000 caracteres como máximo.";

  if (!field) return all;
  return all[field] ? { [field]: all[field] } : {};
}

export function LeadForm() {
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
    setErrors((current) => ({ ...current, ...validate(values, field) }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const form = event.currentTarget;
    const honeypot = (form.elements.namedItem("_gotcha") as HTMLInputElement | null)?.value ?? "";

    if (honeypot.trim().length > 0) return;
    if (Date.now() - renderedAt.current < 2000) return;

    const found = validate(values);
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
          nombre: values.nombre.trim(),
          apellido: values.apellido.trim(),
          email: values.email.trim(),
          marca: values.marca.trim(),
          mensaje: values.mensaje.trim(),
          ...sourceProperties(),
        }),
      });

      if (!response.ok) throw new Error(String(response.status));

      setStatus("sent");
      track("form_submit_success");
    } catch (error) {
      setStatus("idle");
      setSubmitError(NETWORK_ERROR);
      track("form_submit_error", { reason: error instanceof Error ? error.message : "desconocido" });
    }
  };

  if (status === "sent") {
    return (
      <div ref={successRef} role="status" tabIndex={-1} className="glass-card p-10 text-center">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10">
          <Send aria-hidden="true" size={20} className="text-emerald-400" />
        </span>
        <h3 className="mb-2 text-title text-foreground">Mensaje enviado.</h3>
        <p className="text-body text-text-secondary">Te contactaremos en breve.</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} onFocus={onFirstFocus} className="glass-card space-y-5 p-8 md:p-10">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          id="nombre"
          label="Nombre"
          placeholder="Tu nombre"
          autoComplete="given-name"
          maxLength={100}
          value={values.nombre}
          onChange={setValue("nombre")}
          onBlur={onBlurField("nombre")}
          error={errors.nombre}
        />

        <Field
          id="apellido"
          label="Apellido"
          placeholder="Tu apellido"
          autoComplete="family-name"
          maxLength={100}
          value={values.apellido}
          onChange={setValue("apellido")}
          onBlur={onBlurField("apellido")}
          error={errors.apellido}
        />
      </div>

      <Field
        id="email"
        label="Email"
        type="email"
        inputMode="email"
        placeholder="tu@empresa.com"
        autoComplete="email"
        maxLength={255}
        value={values.email}
        onChange={setValue("email")}
        onBlur={onBlurField("email")}
        error={errors.email}
      />

      <Field
        id="marca"
        label="Compañía"
        placeholder="Nombre de tu compañía"
        autoComplete="organization"
        maxLength={160}
        value={values.marca}
        onChange={setValue("marca")}
        onBlur={onBlurField("marca")}
        error={errors.marca}
      />

      <TextareaField
        id="mensaje"
        label="Cuéntanos más sobre tu compañía"
        optional
        rows={4}
        maxLength={2000}
        placeholder="Sector, tamaño de tu comunidad y volumen de ronda que estás valorando"
        value={values.mensaje}
        onChange={setValue("mensaje")}
        onBlur={onBlurField("mensaje")}
        error={errors.mensaje}
      />

      {/* Campo trampa. Invisible para una persona, tentador para un robot. */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[9999px]"
      />

      <Button type="submit" size="lg" fullWidth loading={status === "sending"}>
        Solicitar una evaluación
        <ArrowRight aria-hidden="true" size={16} />
      </Button>

      {submitError ? (
        <p role="alert" className="text-caption text-[#FCA5A5]">
          {submitError}
        </p>
      ) : null}
    </form>
  );
}
