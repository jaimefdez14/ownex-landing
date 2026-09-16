import { useEffect, useRef, useState } from "react";
import { useDrawOnReveal } from "../lib/useDrawOnReveal";
import { costRangeForGross, roundToThousand } from "../lib/capitalEstimate";
import { useCopy } from "../i18n/locale";
import { useFormat } from "../i18n/format";

/*
  LOS ROTULOS POR DEFECTO SON LOS DE EQUITY, y viven aqui porque los pide la propia
  grafica cuando nadie le pasa nada (la modalidad de deuda si se los pasa, desde
  `CalculatorSection`). Antes eran valores por defecto de los parametros; con dos
  idiomas ya no pueden serlo, porque dependen del contexto y un parametro por defecto
  se evalua sin el.

  La descripcion para lectores de pantalla se arma con la misma funcion en los dos
  idiomas: resume la FORMA de la banda, que es lo unico que un dibujo aporta y que el
  texto de arriba no dice.
*/
const COPY = {
  es: {
    titulo: "Coste estimado según el capital captado",
    tituloCorto: "Coste vs. capital",
    tituloEjeY: "Coste estimado, en euros",
    rotuloFicha: "Coste",
    concepto: "coste estimado de la operación",
    ejeX: "Capital captado, en euros",
    fichaCapital: "Capital",
    fichaNexo: "a",
    aria: (concepto: string, low: string, high: string, max: string) =>
      `Horquilla del ${concepto}, que crece y se ensancha con el capital captado: hasta ${low} a ${high} para un capital de ${max}.`,
  },
  en: {
    titulo: "Estimated cost by capital raised",
    tituloCorto: "Cost vs. capital",
    tituloEjeY: "Estimated cost, in euros",
    rotuloFicha: "Cost",
    concepto: "estimated cost of the deal",
    ejeX: "Capital raised, in euros",
    fichaCapital: "Capital",
    fichaNexo: "to",
    aria: (concepto: string, low: string, high: string, max: string) =>
      `Range of the ${concepto}, which grows and widens with the capital raised: up to ${low} to ${high} for capital of ${max}.`,
  },
};

/**
 * Gráfica del coste estimado de la operación según el capital captado. Eje X el
 * capital captado, eje Y el coste.
 *
 * SIMPLIFICADA EL 23-ago-2026. Hasta ahora era un área apilada de dos capas que
 * enseñaba, por separado y al euro, los costes fijos (con su margen del ±20 %
 * marcado con líneas punteadas dentro) y la comisión de éxito de Ownex, más una
 * guía vertical con el punto de equilibrio y una leyenda de cuatro entradas que
 * explicaba cada pieza. Es decir: el modelo de costes completo, con la tarifa de
 * los proveedores y la de Ownex, publicado en una página abierta.
 *
 * Jaime pidió quedarse con la estimación y soltar el detalle. Se retiraron las
 * dos capas, las líneas del margen, la guía y el rótulo del punto de equilibrio,
 * y la leyenda entera.
 *
 * Lo que queda es UNA banda: el área entre el extremo bajo y el alto del coste
 * (`costRangeForGross`), con las cifras redondeadas al millar. El área ya no va
 * del suelo a la curva (que no significaba nada), sino de un extremo al otro, y
 * eso sí dice algo: lo que se ve sombreado ES la horquilla. Como los dos
 * extremos tienen suelo y pendiente distintos, la banda se abre hacia la
 * derecha, que es exactamente lo que pasa con el coste real.
 *
 * Lo que se conserva es lo que hacía atractiva la pieza: ejes reales con marcas
 * redondas, el punto del escenario del visitante y el cursor que recalcula el
 * coste en cualquier punto del dominio con la misma función que usa la cifra de
 * arriba, así que el gráfico y el número nunca pueden desincronizarse.
 *
 * GENERALIZADA EL 04/09/2026, con la modalidad de deuda. La grafica ya no sabe
 * QUE coste dibuja: recibe la funcion que convierte un capital captado en una
 * horquilla de euros (`rangeFor`) y los rotulos que nombran esa magnitud. En
 * equity le llega `costRangeForGross` y pinta el coste de estructurar; en deuda le
 * llega el coste total de la financiacion durante el plazo, cupon incluido.
 *
 * Es la misma pieza en las dos modalidades a proposito, y con los mismos ejes: lo
 * que cambia al conmutar es la INCLINACION de la banda, y esa es exactamente la
 * comparacion que la seccion quiere ensenar. Si cada modalidad tuviera su grafico,
 * con sus ejes y su escala, no habria nada que comparar.
 *
 * La unica condicion que `rangeFor` tiene que cumplir es ser lineal en el capital:
 * la banda se traza con cuatro puntos, sin muestrear. Las dos funciones que se le
 * pasan hoy lo son.
 *
 * `touchAction: "pan-y"` deja que el scroll vertical de la página siga
 * funcionando con el dedo encima del gráfico; solo el gesto horizontal lo
 * captura el propio gráfico.
 *
 * Decorativo a efectos de accesibilidad (`role="img"` con `aria-label` que
 * resume la forma): ninguna cifra de este escenario vive solo aquí dentro, la
 * de arriba la dice en texto.
 */

const VIEW_W = 640;
const VIEW_H = 300;
const PAD_LEFT = 84;
const PAD_RIGHT = 36;
const PAD_TOP = 20;
/* Dos filas debajo del área de trazado: los rótulos del eje X y, debajo, su título. */
const PAD_BOTTOM = 56;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

/**
 * Marcas "redondas" para un eje, al estilo de cualquier gráfica financiera:
 * en vez de dividir el dominio en N trozos iguales (que dan marcas como
 * "43.605"), busca un paso de 1, 2 o 5 por década que sí se lea de un
 * vistazo ("50.000", "100.000"...). Puede devolver menos marcas de las
 * pedidas si el dominio es muy pequeño; nunca más.
 */
function niceStep(max: number, count: number): number {
  const rawStep = max / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const niceResidual = residual < 1.5 ? 1 : residual < 3 ? 2 : residual < 7 ? 5 : 10;
  return niceResidual * magnitude;
}

/**
 * El dominio del eje, ESTIRADO hasta la siguiente marca redonda, y sus marcas.
 *
 * NUEVO EL 04/09/2026, en la revisión de formato, y arregla un corte que se veía en
 * las dos modalidades. Antes el dominio era el valor máximo a pelo y las marcas se
 * quedaban por debajo: con un techo de 99.000 € las marcas llegaban a 80.000, así
 * que la última quinta parte del dibujo no tenía ninguna línea de rejilla y la banda
 * salía por encima de todo hasta morir contra el borde del recuadro. Se leía como si
 * el gráfico estuviera recortado, que es exactamente lo que parecía.
 *
 * Estirando el dominio a la marca siguiente (100.000 en ese caso), la rejilla llega
 * arriba del todo y la banda termina JUSTO por debajo de la última línea. Es como
 * cierra cualquier gráfica financiera, y no cuesta nada: solo dibuja un poco más de
 * dominio del que se pidió.
 */
function niceDomain(max: number, count: number): { max: number; ticks: number[] } {
  if (max <= 0) return { max: 1, ticks: [0] };
  const step = niceStep(max, count);
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step * 0.001; v += step) ticks.push(Math.round(v));
  return { max: top, ticks };
}

export function CapitalCostChart({
  gross,
  rangeFor = costRangeForGross,
  titulo: tituloProp,
  tituloCorto: tituloCortoProp,
  tituloEjeY: tituloEjeYProp,
  rotuloFicha: rotuloFichaProp,
  concepto: conceptoProp,
  quiebros = [],
}: {
  gross: number;
  /** Convierte un capital captado en la horquilla de coste. Tiene que ser lineal. */
  rangeFor?: (gross: number) => { low: number; high: number };
  titulo?: string;
  tituloCorto?: string;
  tituloEjeY?: string;
  rotuloFicha?: string;
  /** Como se nombra la magnitud en la descripción para lectores de pantalla. */
  concepto?: string;
  /*
    Valores de X donde `rangeFor` cambia de pendiente - 05/09/2026.

    La banda se traza con los vértices justos y no muestreando una curva, y eso vale
    mientras `rangeFor` sea una recta. Dejó de serlo cuando el mantenimiento anual del
    registro pasó a llevar un mínimo: por debajo de cierto tamaño de emisión el coste es
    plano y por encima crece, así que hay un codo. Sin decirle al gráfico dónde está, la
    banda se dibujaría como una recta entre los extremos y se saltaría el codo.

    Es la misma mecánica que hubo aquí hasta el 31/08 para el escalón de la fee variable
    del registro, retirada entonces por ser demasiado detalle. Vuelve porque ahora el
    quiebro no es un matiz de 300 €: mueve la banda de verdad.
  */
  quiebros?: number[];
}) {
  const d = useCopy(COPY);
  const f = useFormat();

  const titulo = tituloProp ?? d.titulo;
  const tituloCorto = tituloCortoProp ?? d.tituloCorto;
  const tituloEjeY = tituloEjeYProp ?? d.tituloEjeY;
  const rotuloFicha = rotuloFichaProp ?? d.rotuloFicha;
  const concepto = conceptoProp ?? d.concepto;

  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  /*
    ROTULOS ABREVIADOS EN TELEFONO - 04/09/2026.

    El tamano del texto de dentro del SVG se escribe en unidades del `viewBox`, asi
    que en telefono, con la caja estirada a menos de la mitad, hacen falta 16
    unidades para llegar a un tamano legible en pantalla. Y a 16 unidades
    "120.000" mide unas 62, mas de lo que cabe entre el titulo del eje y el area de
    trazado (56). El resultado era el titulo del eje pisando las cifras.

    Abreviando al millar ("120k") el rotulo baja a unas 24 unidades y cabe de sobra,
    que es ademas como rotula el eje cualquier grafica pequena. En `sm` la caja ya
    es grande, el texto vuelve a 11 unidades y las cifras van completas.

    Arranca en `false` y no leyendo `window`: la pagina se prerenderiza y alli no
    hay ventana que consultar. Mismo criterio y mismo patron que `DotField`.
  */
  const [compacto, setCompacto] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setCompacto(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /** "120k" en telefono, "120.000" desde `sm`. El cero nunca se abrevia. */
  const rotuloMarca = (valor: number) =>
    compacto && valor !== 0 && valor % 1000 === 0
      ? `${f.int(valor / 1000)}k`
      : f.int(valor);

  /*
    Los dos bordes de la banda se trazan al entrar en pantalla. La longitud se
    remide cuando cambia `gross`, porque el dominio del grafico depende de el y
    con una longitud fija el trazo se quedaria corto o largo.
  */
  useDrawOnReveal(svgRef, [gross, rangeFor(0).high, rangeFor(1e6).high]);

  /*
    El dominio deja sitio de sobra a la derecha del escenario del visitante,
    para que no quede pegado al borde y para que explorar "más de lo que tengo
    ahora" sea posible sin salirse. El suelo de 150.000 evita un dominio
    ridículamente estrecho cuando el escenario es muy pequeño.
  */
  const ejeX = niceDomain(Math.max(gross * 1.6, 150000), 4);
  const domainMax = ejeX.max;
  const ejeY = niceDomain(rangeFor(domainMax).high, 4);
  const yDomainMax = ejeY.max;

  const scaleX = (x: number) => PAD_LEFT + (Math.min(domainMax, Math.max(0, x)) / domainMax) * PLOT_W;
  const scaleY = (y: number) =>
    PAD_TOP + PLOT_H - (Math.min(yDomainMax, Math.max(0, y)) / yDomainMax) * PLOT_H;

  /*
    La banda entre los dos extremos. `rangeFor` es lineal a trozos, así que se traza con
    los vértices justos: los dos extremos del dominio más los quiebros que caigan dentro.
    Sigue sin muestrear ninguna curva.
  */
  const end = rangeFor(domainMax);

  /*
    Los vértices de la banda: los dos extremos del dominio más los quiebros que caigan
    dentro. Con `rangeFor` lineal la lista son dos puntos y el trazado es el de siempre.
  */
  const vertices = [0, ...quiebros.filter((x) => x > 0 && x < domainMax), domainMax];
  const bandPath = [
    `M ${scaleX(vertices[0])} ${scaleY(rangeFor(vertices[0]).low)}`,
    ...vertices.slice(1).map((x) => `L ${scaleX(x)} ${scaleY(rangeFor(x).low)}`),
    ...[...vertices].reverse().map((x) => `L ${scaleX(x)} ${scaleY(rangeFor(x).high)}`),
    "Z",
  ].join(" ");

  /* Los dos bordes, como rutas: ya no pueden ser un `<line>`, porque pueden doblarse. */
  const bordeLow = vertices
    .map((x, i) => `${i === 0 ? "M" : "L"} ${scaleX(x)} ${scaleY(rangeFor(x).low)}`)
    .join(" ");
  const bordeHigh = vertices
    .map((x, i) => `${i === 0 ? "M" : "L"} ${scaleX(x)} ${scaleY(rangeFor(x).high)}`)
    .join(" ");

  const pointerToGross = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const ratio = (clientX - rect.left - (PAD_LEFT / VIEW_W) * rect.width) / (rect.width * (PLOT_W / VIEW_W));
    return Math.min(domainMax, Math.max(0, ratio * domainMax));
  };

  const onPointerMove: React.PointerEventHandler<SVGSVGElement> = (event) => {
    const value = pointerToGross(event.clientX);
    if (value !== null) setHoverX(value);
  };

  const scenarioRange = rangeFor(gross);
  const scenarioX = scaleX(gross);
  /* El punto va en el centro de la banda: representa el escenario, no un extremo. */
  const scenarioY = scaleY((scenarioRange.low + scenarioRange.high) / 2);

  const yTicks = ejeY.ticks;
  const xTicks = ejeX.ticks;

  const activeX = hoverX ?? gross;
  const activeRange = rangeFor(activeX);

  /*
    LA FICHA SE PONE DEBAJO CUANDO LA BANDA VA ALTA - 04/09/2026.

    Iba SIEMPRE encima del borde superior de la banda (`-translate-y-118%`), y eso
    valia mientras la banda ocupase la mitad de abajo del dibujo. Con la modalidad
    de deuda deja de valer: alli la banda cruza el grafico entero, asi que su borde
    superior queda a un dedo del techo y la ficha se salia por arriba de la tarjeta,
    tapando el titulo del bloque. Se ve en la primera captura de la seccion, y en
    equity ya rozaba: la ficha mordia la ultima palabra del titulo.

    Ahora se mira donde cae el borde superior de la banda en ese punto: si hay hueco
    encima, la ficha va encima como siempre; si no, se cuelga del borde INFERIOR y
    cae dentro del dibujo. Es la misma pieza y la misma lectura, solo que no se sale
    nunca de su caja.

    El umbral son 96 unidades del `viewBox` por debajo del techo del area de
    trazado: la ficha mide unas 70 de alto una vez estirada, mas el aire que la
    separa de la banda.
  */
  const bandaTop = scaleY(activeRange.high);
  const fichaEncima = bandaTop > PAD_TOP + 96;
  const fichaY = fichaEncima ? bandaTop : scaleY(activeRange.low);

  return (
    <div className="rounded-md border border-border bg-card/40 p-3 sm:p-4">
      {/*
        El titulo se acorta en telefono: "Coste estimado según el capital
        captado" en versales con tracking se iba a dos lineas, y los dos titulos
        de eje del propio grafico ya dicen exactamente eso ("Coste estimado, en
        euros" / "Capital captado, en euros"). En telefono con "Coste vs.
        capital" basta para rotular el bloque.
      */}
      <p className="mb-2 text-micro uppercase text-text-tertiary sm:mb-3">
        <span className="sm:hidden">{tituloCorto}</span>
        <span className="hidden sm:inline">{titulo}</span>
      </p>

      <div className="relative">
        <svg
          ref={svgRef}
          role="img"
          aria-label={d.aria(
            concepto,
            f.euros(roundToThousand(end.low)),
            f.euros(roundToThousand(end.high)),
            f.euros(roundToThousand(domainMax)),
          )}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          /*
            PROPORCION FIJA EN VEZ DE ALTURAS SUELTAS - 04/09/2026.

            Llevaba tres alturas en pixeles (150 / 240 / 340) sobre un `viewBox` de
            640x300 con `preserveAspectRatio="none"`. Esa combinacion DEFORMA todo lo
            que hay dentro, y muy en particular el texto: los dos ejes escalan
            distinto, asi que los rotulos salian estirados en un eje y comprimidos en
            el otro. Medido: en escritorio la caja daba 604x340, o sea 0,94 de escala
            horizontal contra 1,13 de vertical, y las cifras del eje se pintaban un
            20 % mas altas que anchas.

            Con la proporcion del `viewBox` puesta en la caja (64/30), las dos escalas
            son la misma y la deformacion es cero. De paso el alto deja de ser un
            numero elegido a ojo y pasa a salir del ancho disponible: unos 283px en
            escritorio (mas que los 240 de antes, que era el motivo de subirlo) y unos
            168 en telefono (mas que los 150 de antes).
          */
          className="aspect-[64/30] w-full touch-pan-y"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverX(null)}
        >
          {/* Rejilla horizontal + rótulos del eje Y. Solo el número: la unidad va en el título del eje. */}
          {yTicks.map((t) => (
            <g key={`y-${t}`}>
              <line
                x1={PAD_LEFT}
                y1={scaleY(t)}
                x2={PAD_LEFT + PLOT_W}
                y2={scaleY(t)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
              />
              <text
                x={PAD_LEFT - 10}
                y={scaleY(t) + 4}
                textAnchor="end"
                /*
                  MAS GRANDE EN TELEFONO - 04/09/2026. El tamano se escribe en
                  unidades del `viewBox`, no en pixeles de pantalla: al estirarse la
                  caja a 168px de alto sobre 300 unidades, esos 11 se quedaban en 6,2
                  px reales, o sea la mitad del minimo de cualquier rotulo de la
                  pagina. En `sm` la caja ya es lo bastante grande y vuelven los 11.
                */
                className="fill-text-tertiary text-[16px] tabular sm:text-[11px]"
              >
                {rotuloMarca(t)}
              </text>
            </g>
          ))}

          {/* Rótulos del eje X, en las mismas marcas redondas. */}
          {xTicks.map((t) => (
            <text
              key={`x-${t}`}
              x={scaleX(t)}
              y={PAD_TOP + PLOT_H + 20}
              textAnchor="middle"
              /* Mismo motivo que los rotulos del eje Y. */
              className="fill-text-tertiary text-[16px] tabular sm:text-[11px]"
            >
              {rotuloMarca(t)}
            </text>
          ))}

          {/* Títulos de eje: dicen QUÉ mide cada uno, y la unidad, una sola vez. */}
          <text
            x={PAD_LEFT + PLOT_W / 2}
            y={VIEW_H - 8}
            textAnchor="middle"
            className="fill-text-secondary text-[14px] font-medium uppercase sm:text-[10px]"
            style={{ letterSpacing: "0.04em" }}
          >
            {d.ejeX}
          </text>
          <text
            x={18}
            y={PAD_TOP + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90, 18, ${PAD_TOP + PLOT_H / 2})`}
            className="fill-text-secondary text-[14px] font-medium uppercase sm:text-[10px]"
            style={{ letterSpacing: "0.04em" }}
          >
            {tituloEjeY}
          </text>

          {/* La banda del coste: lo sombreado es la horquilla, de extremo a extremo. */}
          <path d={bandPath} className="draw-area fill-emerald-400/20" />
          <path
            d={bordeLow}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            /*
              `currentColor` sobre `text-accent-ink`, no el `#34D399` a fuego que
              habia aqui. Ese hex es del sistema oscuro de antes y se retiro como
              acento en reposo el 25/08 por resplandecer; sobre la tarjeta clara de
              esta seccion daba ademas 2,5:1, o sea una linea de datos que casi no
              se ve. Con la variable del tema, la grafica sigue al tema de su seccion sea cual
              sea.
            */
            className="draw-line text-accent-ink"
          />
          <path
            d={bordeHigh}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            /* Mismo motivo que la ruta de arriba. */
            className="draw-line text-accent-ink"
          />

          {/* El cursor de exploración, solo mientras hay un puntero encima. */}
          {hoverX !== null ? (
            <line
              x1={scaleX(hoverX)}
              y1={scaleY(rangeFor(hoverX).high)}
              x2={scaleX(hoverX)}
              y2={scaleY(0)}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="text-foreground"
            />
          ) : null}

          {/* El punto del escenario del visitante: siempre visible, distinto del cursor. */}
          {/*
            El relleno era `#0A0B0C`, un negro que se retiro de la paleta el 25/08,
            y el borde `#34D399`. Los dos a fuego: el punto se veia igual daba el
            tema de la seccion, que es justo lo que rompe cuando la seccion cambia
            de lienzo. Ahora el relleno es el fondo de la tarjeta y el trazo el
            acento, los dos por variable de tema.
          */}
          <circle
            className="draw-area fill-card text-accent-ink"
            cx={scenarioX}
            cy={scenarioY}
            r="5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle className="draw-area fill-emerald-400" cx={scenarioX} cy={scenarioY} r="2" />
        </svg>

        {/*
          La etiqueta flotante sigue al cursor cuando hay uno; si no, describe
          el escenario del visitante. Nunca están las dos a la vez.

          Posicionada en PORCENTAJE, no en píxeles del `viewBox`: el SVG tiene
          `preserveAspectRatio="none"`, así que sus unidades internas se
          estiran para llenar el ancho y el alto reales del contenedor, que
          casi nunca coinciden con las del `viewBox`. El porcentaje es el
          mismo punto relativo se estire lo que se estire el SVG.
        */}
        {/*
          REHECHA EL 26/08/2026. Decia literalmente
          "150.000 € → 18.000 € a 29.000 €": tres cifras, una flecha y un "a"
          sueltos en una linea, sin decir que era cada numero. Habia que
          adivinarlo.

          Ahora es una ficha con dos filas rotuladas, una por magnitud, y el
          coste alineado a la derecha para que las cifras se lean en columna. El
          punto de color repite el de la banda, asi que la ficha y el dibujo se
          reconocen como lo mismo.

          Los rotulos son "Capital" y "Coste" a secas, no "Si captas" y "Te
          cuesta": en una ficha de datos de una operacion financiera, el nombre
          de la magnitud es lo profesional; la frase en segunda persona sonaba a
          folleto.
        */}
        {/*
          LA FICHA NO EXISTE EN TELEFONO - 29/08/2026.

          Historial: primero flotaba sobre el punto y se salia de la tarjeta
          tapando el titulo; luego (29/08, primera pasada) se bajo a una linea de
          lectura fija debajo del grafico. Pero esa linea decia "Capital 150.000
          / Coste 18.000 a 29.000", que es EXACTAMENTE lo que las dos primeras
          cifras del bloque de resultados ("Capital captable" y "Coste estimado")
          ya dicen tres dedos mas arriba. Repetir la respuesta al pie del grafico
          no anade lectura, anade alto a una tarjeta que sobra de alto.

          En una pantalla tactil no hay puntero, asi que la ficha nunca se mueve
          de ese escenario: no es un cursor, es un eco. Se quita por debajo de
          `sm`. Desde `sm` vuelve a flotar y a seguir al raton, que es cuando si
          dice algo que las cifras de arriba no: el coste en cualquier punto del
          dominio, no solo en el del visitante.
        */}
        {/*
          LA FICHA SOLO EXISTE CON EL CURSOR ENCIMA - 04/09/2026.

          Hasta hoy, sin cursor, la ficha describia el escenario del visitante. Y eso
          es un ECO: "Capital 150.000 / Coste 53.000 a 68.000" es palabra por palabra
          lo que dicen las dos primeras cifras de la fila de resultados, tres dedos
          mas arriba. Es el mismo argumento por el que el 29/08 se retiro en telefono;
          lo que faltaba era aplicarlo tambien en reposo en escritorio.

          Y desde que la banda de deuda cruza el grafico entero, ese eco ademas TAPA
          la banda por el medio, o sea que quitaba informacion en vez de anadirla.

          Con el cursor encima si dice algo que no esta en ningun otro sitio: el coste
          en cualquier punto del dominio. Ahi aparece. El escenario del visitante lo
          sigue marcando el punto, que no se ha movido de su sitio.
        */}
        {hoverX === null ? null : (
        <div
          aria-hidden="true"
          className="pointer-events-none hidden rounded-md border border-border bg-card px-3 py-2 shadow-[0_10px_28px_-10px_rgba(14,15,12,0.35)] sm:absolute sm:block"
          style={{
            left: `${Math.min(84, Math.max(((PAD_LEFT + 8) / VIEW_W) * 100, (scaleX(activeX) / VIEW_W) * 100))}%`,
            top: `${(fichaY / VIEW_H) * 100}%`,
            /*
              Las dos traslaciones van juntas en linea y ya no en clases: la
              vertical depende de si la ficha se cuelga por arriba o por abajo, y
              una utilidad de Tailwind no puede decidir eso.
            */
            transform: `translate(-50%, ${fichaEncima ? "-118%" : "18%"})`,
          }}
        >
          <p className="flex items-baseline justify-between gap-5 whitespace-nowrap">
            <span className="text-micro uppercase text-text-tertiary">{d.fichaCapital}</span>
            <span className="text-caption font-medium tabular text-foreground">
              {f.euros(roundToThousand(activeX))}
            </span>
          </p>
          <p className="mt-1 flex items-baseline justify-between gap-5 whitespace-nowrap border-t border-border pt-1">
            <span className="flex items-center gap-[6px] text-micro uppercase text-text-tertiary">
              <span className="h-[6px] w-[6px] rounded-full bg-emerald-400" />
              {rotuloFicha}
            </span>
            <span className="text-caption font-medium tabular text-foreground">
              {f.euros(roundToThousand(activeRange.low))}
              {/* El nexo de la horquilla, en su idioma: "a" / "to". */}
              <span className="px-1 font-normal text-text-tertiary">{d.fichaNexo}</span>
              {f.euros(roundToThousand(activeRange.high))}
            </span>
          </p>
        </div>
        )}
      </div>
    </div>
  );
}
