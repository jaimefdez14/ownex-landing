import { useEffect, useLayoutEffect, useRef } from "react";
import { Field } from "./Field";
import { useFormat } from "../../i18n/format";

/**
 * Campo numerico que se ve ya formateado mientras se escribe.
 *
 * POR QUE EXISTE - 28/08/2026. Los tres campos del simulador eran
 * `<input type="number">`, y ese tipo NO admite separadores: el navegador solo
 * acepta un numero en punto flotante, asi que la valoracion se leia "2000000" a
 * pelo. En una pagina que formatea al milimetro cada cifra que ENSEÑA (punto de
 * millar, espacio duro antes del simbolo, §4.1 de la marca), las tres unicas
 * cifras que el visitante ESCRIBE eran las unicas sin formato. Y son ademas las
 * mas dificiles de leer: contar seis ceros seguidos para comprobar si has puesto
 * dos millones o veinte es exactamente el tipo de friccion que hace abandonar un
 * simulador.
 *
 * Ahora se ve "2.000.000 €" y "1.500 €" segun se teclea, con el mismo formato que
 * el resto del sitio, reutilizando `formatEuros` y `formatInt` para que no haya
 * dos verdades sobre como se escribe un numero aqui.
 *
 * TRES DECISIONES QUE NO SON OBVIAS:
 *
 *  - `type="text"` con `inputMode="numeric"`. Es la unica combinacion que permite
 *    pintar puntos y simbolo dentro del campo Y seguir abriendo el teclado
 *    numerico en el movil. `type="number"` daria el teclado pero rechaza todo lo
 *    que no sea un numero pelado; `type="text"` a secas daria el teclado
 *    completo, que en un campo de importes es peor.
 *
 *  - EL CURSOR SE RECOLOCA A MANO. Reescribir el valor en cada pulsacion es lo
 *    que mete los puntos, pero tambien lo que manda el cursor al final: si
 *    alguien corrige un digito por el medio, el siguiente que escriba aparece al
 *    final. Se resuelve contando DIGITOS (no caracteres) antes del cursor y
 *    volviendo a colocarlo tras esa misma cantidad de digitos en el texto nuevo.
 *    Contar caracteres no valdria: al escribir el cuarto digito aparece un punto
 *    de la nada y todo lo que hay detras se desplaza una posicion.
 *
 *  - SE LIMPIA, NO SE RECHAZA. Del texto que llega se queda con los digitos y
 *    tira el resto, asi que da igual que alguien pegue "1.500 €", "1500€" o
 *    "1 500": las tres formas entran como 1500. Un campo de importe que rechaza
 *    lo que el propio campo acaba de escribir es la trampa clasica de este
 *    patron.
 *
 * El valor sigue viviendo fuera como NUMERO: este componente solo traduce entre
 * ese numero y su representacion. La calculadora no se entera de que hay formato.
 */

/*
  `useLayoutEffect` en el navegador y `useEffect` en el servidor.

  La pagina se PRERENDERIZA (`scripts/prerender.mjs`), asi que este componente se
  ejecuta tambien en Node, y alli `useLayoutEffect` avisa por consola en cada
  render: no puede correr, porque no hay diseño que medir. El aviso salia tres
  veces por build, una por campo.

  En el navegador si tiene que ser `useLayoutEffect` y no `useEffect`: recoloca el
  cursor, y con `useEffect` esa correccion llega DESPUES de pintar, o sea que se
  ve un fotograma con el cursor en el sitio equivocado.

  En la practica el efecto no hace nada en el servidor de todas formas: solo actua
  cuando `caretDigits` trae algo, y eso solo lo pone una pulsacion de teclado.
*/
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
export function NumericField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /*
    "€" formatea con `formatEuros` y "%" con `formatPercent`; sin sufijo, con
    `formatInt`. El "%" entro el 04/09/2026 con el cupon de la modalidad de deuda:
    es el primer campo del simulador que no pide euros, y sin esto era el unico que
    se escribia a pelo en una pantalla donde todo lo demas se ve ya formateado.
  */
  suffix?: "€" | "%";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  /* Digitos que habia antes del cursor en la ultima pulsacion. -1 = no tocar. */
  const caretDigits = useRef(-1);

  /*
    El cero se pinta VACIO, no "0 €". Si no, borrar el campo del todo es
    imposible: quitas el ultimo digito y reaparece un cero que hay que volver a
    borrar. Y el vacio no deja a nadie colgado, porque es justo lo que dispara el
    estado "indica cuantos inversores estimas y su ticket medio" de la seccion.
  */
  /*
    Con el formato del idioma activo: "150.000 €" en espanol, "€150,000" en ingles.
    La recolocacion del cursor cuenta DIGITOS, no caracteres, asi que funciona igual
    con el simbolo delante o detras y con cualquier separador.
  */
  const f = useFormat();
  const format = (n: number) => {
    if (n === 0) return "";
    if (suffix === "€") return f.euros(n);
    if (suffix === "%") return f.percent(n);
    return f.int(n);
  };

  useIsomorphicLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || caretDigits.current < 0) return;

    const objetivo = caretDigits.current;
    caretDigits.current = -1;

    /* Avanza por el texto ya formateado hasta haber pasado `objetivo` digitos. */
    let vistos = 0;
    let pos = 0;
    while (pos < input.value.length && vistos < objetivo) {
      if (/\d/.test(input.value[pos])) vistos += 1;
      pos += 1;
    }
    input.setSelectionRange(pos, pos);
  });

  const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const bruto = event.target.value;
    const cursor = event.target.selectionStart ?? bruto.length;

    caretDigits.current = (bruto.slice(0, cursor).match(/\d/g) ?? []).length;

    const digitos = bruto.replace(/\D/g, "");
    const numero = digitos === "" ? 0 : Number(digitos);

    let acotado = Math.max(min, numero);
    if (max !== undefined) acotado = Math.min(max, acotado);
    onChange(acotado);
  };

  return (
    <Field
      ref={inputRef}
      id={id}
      label={label}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      /*
        El campo se pinta y se corrige solo, asi que la correccion automatica y las
        sugerencias del navegador no tienen nada que aportar y si pueden estorbar.
      */
      spellCheck={false}
      value={format(value)}
      onChange={onInput}
    />
  );
}
