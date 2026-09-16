import { useEffect, useRef, type RefObject } from "react";

/**
 * Traza las rutas de un SVG cuando entra en pantalla.
 *
 * PRINCIPIO DE SEGURIDAD, y es el motivo de que este hook sea autonomo en vez
 * de apoyarse en la clase `is-visible` de un ancestro:
 *
 *   nada se oculta hasta que este codigo puede garantizar que lo va a mostrar.
 *
 * La primera version dejaba el estado oculto en el CSS (`stroke-dashoffset` a la
 * longitud completa bajo `html.js`) y esperaba que un ancestro `.reveal` o
 * `.draw-on` recibiera `is-visible`. Medido: cargando la pagina y sin tocar
 * nada, a los 4 segundos las tres graficas seguian SIN TRAZAR y cinco rellenos
 * invisibles. Basta con que la cadena de clases no cuadre, o con que el ancestro
 * este bajo `content-visibility: auto` fuera de pantalla, para que una grafica
 * no aparezca jamas. Un efecto decorativo no puede tener ese modo de fallo.
 *
 * Ahora el orden es: medir -> armar -> observar -> disparar, todo aqui. Si
 * cualquier paso falla, el SVG se queda como esta, o sea VISIBLE, porque el
 * estado oculto solo se aplica en el paso "armar", justo despues de haber
 * montado el observador que lo va a desarmar.
 *
 * Salvaguardas, en el mismo espiritu que `useReveal`:
 *  - Sin `IntersectionObserver` o con movimiento reducido, no se arma nada.
 *  - Pase lo que pase, a los 2500 ms se desarma lo que siga pendiente.
 */
/*
  Longitud de la ruta EN PANTALLA, no en unidades del viewBox.

  Hace falta cuando el trazo lleva `vector-effect: non-scaling-stroke`, y el motivo
  es una trampa fina de SVG: con esa propiedad el navegador deja de escalar el
  trazo con el resto del dibujo, y eso incluye el patron de guiones. O sea que
  `stroke-dasharray` pasa a interpretarse en PIXELES DE PANTALLA, mientras que
  `getTotalLength()` sigue devolviendo unidades del viewBox. Si se mezclan, el
  guion sale mucho mas corto que la ruta y se repite.

  Se vio en la grafica del panel del hero: la ruta mide 106,9 unidades en un
  viewBox de 100 de ancho, pero se dibuja sobre 634px de pantalla. Con
  `stroke-dasharray: 107px` el patron cabia casi seis veces, asi que la linea
  aparecia partida en trozos con huecos entre ellos. Jaime lo vio antes que yo.

  No vale con multiplicar por la escala horizontal: con `preserveAspectRatio="none"`
  los dos ejes escalan distinto y la cuenta solo saldria para rutas horizontales.
  Se mide de verdad, muestreando la ruta y transformando cada punto por la matriz
  de pantalla. Sesenta y cuatro muestras sobran para una curva de grafica y es una
  sola vez por montaje.
*/
function largoEnPantalla(linea: SVGPathElement, largoDeUsuario: number): number {
  const ctm = linea.getScreenCTM();
  if (!ctm || typeof linea.getPointAtLength !== "function") return largoDeUsuario;

  const MUESTRAS = 64;
  let total = 0;
  let anterior: DOMPoint | null = null;

  for (let i = 0; i <= MUESTRAS; i += 1) {
    const punto = linea.getPointAtLength((largoDeUsuario * i) / MUESTRAS).matrixTransform(ctm);
    if (anterior) total += Math.hypot(punto.x - anterior.x, punto.y - anterior.y);
    anterior = punto;
  }

  /*
    Y se redondea al alza un 12 %. No es pereza, es que los dos errores no cuestan
    lo mismo:

      quedarse CORTO  el guion se repite y la linea sale partida, que es el fallo
                      que este codigo existe para arreglar;
      pasarse         el trazo termina de dibujarse un poco antes de que el
                      recorrido acabe, y no lo nota nadie.

    Y quedarse corto es facil. Esta medida se toma al montar, y en el panel del
    hero eso ocurre mientras su envoltorio aun esta a media animacion de entrada,
    a escala 0,965: la matriz de pantalla incluye esa escala y devuelve 613px para
    una ruta que acabara midiendo 634. A eso se suma que muestrear una polilinea
    recorta un poco las esquinas. El margen cubre las dos cosas.
  */
  return total > 0 ? total * 1.12 : largoDeUsuario;
}

/*
  SE TRAZA UNA VEZ, NO EN CADA CAMBIO DE DATOS - 04/09/2026.

  Este hook recibe dependencias (los datos que cambian la ruta) y hasta hoy volvia a
  ARMAR el trazado cada vez que cambiaban: ocultaba la grafica entera y la
  redibujaba de izquierda a derecha. Con `[gross]` como unica dependencia ya
  chirriaba; al entrar la modalidad de deuda, con el cupon y el plazo tambien en la
  lista, se volvio evidente.

  Medido: cada cambio dejaba la grafica EN BLANCO durante 1,8 s (1.100 ms de trazo
  con 120 de retardo para las lineas, 700 con 520 para el relleno). O sea que tocar
  una pastilla de cupon, que es un gesto que se repite cinco o seis veces seguidas
  mientras se tantea un escenario, borraba la respuesta cada vez. Una captura de la
  seccion tomada 900 ms despues de conmutar salia con el grafico vacio, que es
  exactamente lo que veia el visitante.

  Esto es una animacion DE ENTRADA: cuenta que la grafica ha llegado. Una vez
  contado, no hay nada que volver a contar. A partir de ahora, si el SVG ya se
  dibujo, el efecto se limita a REMEDIR `--draw-len` (que sigue haciendo falta: la
  longitud de la ruta cambia con el dominio, y si el dia de manana el elemento se
  vuelve a armar, tiene que armarse con la medida buena) y se va sin tocar las
  clases. El resultado es que los datos nuevos aparecen al instante, ya trazados.
*/
export function useDrawOnReveal(
  ref: RefObject<SVGSVGElement | null>,
  deps: unknown[] = [],
) {
  /*
    Vive fuera del efecto a proposito: tiene que sobrevivir a que las dependencias
    cambien, que es justo cuando se consulta. Un `useState` habria forzado un
    render de mas sin que nadie pinte nada distinto.
  */
  const yaTrazado = useRef(false);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const lineas = Array.from(svg.querySelectorAll<SVGPathElement>(".draw-line"));
    if (lineas.length === 0) return;

    const desarmar = () => {
      svg.classList.add("draw-done");
      yaTrazado.current = true;
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      desarmar();
      return;
    }

    // 1) Medir. Sin longitud real no se arma: una longitud inventada deja el
    //    trazo a medias en cuanto el grafico cambia de dominio.
    let medidas = 0;
    for (const linea of lineas) {
      if (typeof linea.getTotalLength !== "function") continue;
      const enUsuario = linea.getTotalLength();
      if (!Number.isFinite(enUsuario) || enUsuario === 0) continue;

      /*
        El guion se mide en el mismo espacio en el que lo va a interpretar el
        navegador: pantalla si el trazo no escala, unidades del viewBox si si.
      */
      const noEscala =
        linea.getAttribute("vector-effect") === "non-scaling-stroke" ||
        getComputedStyle(linea).vectorEffect === "non-scaling-stroke";
      const len = noEscala ? largoEnPantalla(linea, enUsuario) : enUsuario;
      if (!Number.isFinite(len) || len === 0) continue;

      linea.style.setProperty("--draw-len", String(Math.ceil(len)));
      medidas += 1;
    }
    if (medidas === 0) {
      desarmar();
      return;
    }

    /*
      Ya se conto: los datos nuevos entran ya dibujados. La medida de arriba se
      queda hecha, que es lo unico que este paso tenia que dejar al dia.
    */
    if (yaTrazado.current) {
      desarmar();
      return;
    }

    // 2) Armar: a partir de aqui el SVG esta oculto, y el observador de abajo
    //    ya existe para descubrirlo.
    svg.classList.add("draw-armed");
    svg.classList.remove("draw-done");

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        desarmar();
        observer.disconnect();
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(svg);

    const red = window.setTimeout(desarmar, 2500);

    return () => {
      window.clearTimeout(red);
      observer.disconnect();
      desarmar();
    };
    // Las dependencias las decide quien lo usa: son los datos que cambian la ruta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);
}
