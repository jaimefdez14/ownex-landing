import { memo, useEffect, useRef, useState } from "react";

const TWO_PI = Math.PI * 2;

type DotFieldProps = {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  bulgeStrength?: number;
  glowRadius?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  minWidth?: number;
};

type Dot = { ax: number; ay: number; sx: number; sy: number };

/**
 * Retícula de puntos reactiva al cursor. Es la textura del hero.
 *
 * HISTORIA, porque este archivo ya se borró una vez y conviene que no se vuelva a
 * borrar por el mismo malentendido. Nació con el hero sobre fondo casi negro,
 * portado del `DotField.jsx` del proyecto de Lovable. El 25/08/2026 la página pasó
 * a claro dominante (`brand/BRAND.md` §9.1) y la retícula se quedó fuera: estaba
 * calibrada en esmeralda sobre negro y sobre blanco no se veía. El 28/08 se
 * BORRÓ el componente, no por una decisión de diseño sino porque llevaba semanas
 * sin que lo importara nadie.
 *
 * VUELVE EL 31/08/2026, a petición de Jaime, RECALIBRADO PARA CLARO. Es la única
 * diferencia con la versión original, y son solo los tres colores por defecto de
 * abajo: la mecánica, el presupuesto de píxeles y las cinco paradas de seguridad
 * son las mismas de entonces.
 *
 * Las cinco cosas que esta versión hace y el original de Lovable no, todas por el
 * mismo motivo: aquel mantenía un bucle de animación y un temporizador corriendo
 * de forma permanente, mirase o no el visitante.
 *
 *  1. Se detiene por completo cuando el hero sale de pantalla (`IntersectionObserver`)
 *     y cuando la pestaña pasa a segundo plano. El original nunca paraba: seguía
 *     pintando 60 fotogramas por segundo con la página entera scrolleada.
 *  2. El `setInterval` cada 20 ms que medía la velocidad del ratón se ha integrado en
 *     el propio bucle de animación. Eran dos relojes para una sola cosa.
 *  3. Con `prefers-reduced-motion: reduce` los puntos se pintan una sola vez, quietos
 *     y sin reaccionar al cursor.
 *  4. El `mousemove` global se sustituye por uno sobre el propio contenedor, así que
 *     deja de recalcularse en toda la página.
 *  5. Se salta el dibujado si el contenedor no tiene tamaño, en lugar de construir
 *     una retícula vacía.
 *
 * Y una sexta que se añade ahora: cuando el cursor se para y los puntos han vuelto
 * a su sitio, el bucle se DETIENE en vez de repintar lo mismo. En reposo, esta
 * retícula cuesta cero.
 *
 * Decorativo a todos los efectos: es un `<canvas>` sin contenido textual, marcado
 * como `aria-hidden`. Sin JavaScript no se pinta nada y el hero se lee igual, porque
 * es un fondo, no contenido.
 *
 * NO EXISTE EN TELEFONO - 31/08/2026, a peticion de Jaime ("elimina para movil el
 * fondo de puntitos").
 *
 * Por debajo de `sm` (640px) el componente devuelve `null`: ni nodo, ni lienzo, ni
 * observador, ni oyentes. No se oculta con CSS a proposito, y el motivo es que
 * ocultar no ahorra nada de lo que aqui cuesta. Todo el coste de esta retícula es
 * JavaScript -- construir la retícula de puntos, dimensionar el lienzo al DPR y
 * pintarlos uno a uno-- y ese trabajo lo hace igual un elemento con `display: none`
 * mientras el efecto siga montado. Un `hidden sm:block` habria quitado la textura de
 * la vista dejando intacta la factura.
 *
 * Y la factura era justo lo que ya se habia medido aqui: en telefono este lienzo
 * llegaba a 780x2545 y, sin el presupuesto de pixeles de mas abajo, bajaba el
 * Rendimiento de Lighthouse de 99 a 88. El presupuesto lo dejo asumible; no
 * ejecutarlo lo deja en cero.
 *
 * Ademas, en telefono la retícula no hacia la mitad de lo que sabe hacer: el bulto y
 * el halo los dirige el cursor, y en tactil `(pointer: fine)` es falso, asi que ya
 * solo se pintaba quieta. Lo que se pierde al quitarla es una textura fija.
 *
 * El corte es reactivo (`matchMedia` con oyente), no una lectura de una sola vez:
 * al girar un telefono a horizontal o al estrechar una ventana de escritorio, la
 * retícula entra y sale sola.
 *
 * El umbral es `minWidth` y vale 640 porque es el `sm` de Tailwind, que es el mismo
 * escalon en el que el hero deja de ser una columna (ver `HeroSection`). Si algun
 * dia se quiere de vuelta en telefono, se pasa `minWidth={0}` y no hace falta tocar
 * nada mas.
 */
export const DotField = memo(function DotField({
  dotRadius = 1.2,
  dotSpacing = 18,
  cursorRadius = 500,
  bulgeStrength = 67,
  glowRadius = 220,
  /*
    LOS TRES COLORES, RECALIBRADOS PARA EL LIENZO CLARO - 31/08/2026.

    El original era esmeralda #34D399 a 0,55 de alfa sobre casi negro. Sobre blanco
    ese verde claro no existe: es más luminoso que el fondo sobre el que tendría que
    destacar.

    Ahora el degradado va de acento a tinta, en diagonal: verde de marca (#047857)
    arriba a la izquierda, donde está el titular, disolviéndose en gris de tinta
    (#0E0F0C) abajo a la derecha. La razón de que el verde ocupe SOLO esa esquina es
    el presupuesto de acento (§8.6): un campo entero de puntos verdes sería color de
    marca repartido por media pantalla, que es exactamente lo que la regla evita.

    Los alfas son altos para lo que parecen (0,40 y 0,14) porque un punto de 1,2px de
    diámetro tiene una fracción del área de una línea de 1px: `--grid-line` se
    conforma con 0,035 porque es una línea continua. Aquí, por debajo de 0,10, la
    retícula simplemente no aparece.
  */
  gradientFrom = "rgba(4, 120, 87, 0.40)",
  gradientTo = "rgba(14, 15, 12, 0.14)",
  /*
    El halo que sigue al cursor. Sobre negro iba a 0,30; sobre blanco un alfa así
    lava el color y deja una mancha gris verdosa. A 0,16 se lee como luz.
  */
  glowColor = "rgba(4, 120, 87, 0.16)",
  minWidth = 640,
}: DotFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const glowIdRef = useRef(`dot-field-glow-${Math.random().toString(36).slice(2, 9)}`);

  /*
    Arranca en `false` y no en una lectura de `window`: este componente se
    prerenderiza (`entry-server.tsx`), asi que en el primer render no hay `window`
    que consultar. No es una concesion, es lo que ya pasaba: el lienzo se pinta
    dentro de un efecto, asi que en el HTML servido siempre estuvo vacio.
  */
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [minWidth]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const glowEl = glowRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    /*
      Presupuesto de pixeles del lienzo.

      El hero mide toda la altura de la pantalla y, en movil, al apilarse el
      contenido llega a 1273px de alto. Multiplicado por un DPR de 2, el lienzo
      salia a 780x2545, casi dos millones de pixeles, solo para pintar una textura
      de puntos de medio pixel de radio. Medido con Lighthouse: el `DotField` por si
      solo bajaba el Rendimiento de 99 a 88 y metia 450ms de bloqueo del hilo
      principal.

      La densidad se ajusta para no pasar de ~800.000 pixeles de dispositivo. En
      pantallas grandes o muy densas baja hasta 1, y en una textura de puntos tan
      tenue la diferencia no se aprecia.
    */
    const MAX_CANVAS_PIXELS = 800_000;
    const deviceDpr = Math.min(window.devicePixelRatio || 1, 2);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /*
      El efecto lo dirige el cursor, asi que en un dispositivo tactil no tiene nada
      que hacer: no hay puntero que seguir. El original lo animaba igualmente a 60
      fotogramas por segundo, y en la CPU simulada de un movil eso bloqueaba el hilo
      principal mas de tres segundos. En tactil se pinta la reticula quieta y no se
      arranca ningun bucle.
    */
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const interactive = finePointer && !reducedMotion;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let resizeTimer = 0;
    let onScreen = true;

    const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    let engagement = 0;
    let glowOpacity = 0;

    function buildDots() {
      const step = dotRadius + dotSpacing;
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);
      const padX = (width % step) / 2;
      const padY = (height % step) / 2;
      const next: Dot[] = new Array(Math.max(rows * cols, 0));
      let i = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          next[i++] = { ax, ay, sx: ax, sy: ay };
        }
      }
      dots = next;
    }

    function paintStatic() {
      ctx!.clearRect(0, 0, width, height);
      const grad = ctx!.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, gradientFrom);
      grad.addColorStop(1, gradientTo);
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      const rad = dotRadius / 2;
      for (const d of dots) {
        ctx!.moveTo(d.ax + rad, d.ay);
        ctx!.arc(d.ax, d.ay, rad, 0, TWO_PI);
      }
      ctx!.fill();
    }

    function doResize() {
      const rect = container!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width <= 0 || height <= 0) return;

      // La densidad se recalcula en cada cambio de tamano: el alto del hero varia
      // mucho entre movil y escritorio, y con el el presupuesto disponible.
      const budgetDpr = Math.sqrt(MAX_CANVAS_PIXELS / (width * height));
      const dpr = Math.max(1, Math.min(deviceDpr, budgetDpr));

      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
      // Siempre se pinta un fotograma en reposo, no solo con movimiento reducido.
      // Si la pagina se carga en una pestana de fondo, el bucle no arranca hasta que
      // pasa a primer plano, y sin esto el lienzo se quedaria vacio hasta entonces.
      paintStatic();
    }

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(doResize, 100);
    }

    function onMouseMove(event: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      start(); // despierta el bucle si se habia detenido en reposo
    }

    function onMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
      start(); // deja que los puntos vuelvan a su sitio con animacion
    }

    function tick() {
      // Velocidad del cursor, antes en un setInterval aparte.
      const dxSpeed = mouse.prevX - mouse.x;
      const dySpeed = mouse.prevY - mouse.y;
      const moved = Math.sqrt(dxSpeed * dxSpeed + dySpeed * dySpeed);
      mouse.speed += (moved - mouse.speed) * 0.25;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      const target = Math.min(mouse.speed / 5, 1);
      engagement += (target - engagement) * 0.06;
      if (engagement < 0.001) engagement = 0;

      glowOpacity += (engagement - glowOpacity) * 0.08;
      if (glowEl) {
        glowEl.setAttribute("cx", String(mouse.x));
        glowEl.setAttribute("cy", String(mouse.y));
        glowEl.style.opacity = String(glowOpacity);
      }

      ctx!.clearRect(0, 0, width, height);
      const grad = ctx!.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, gradientFrom);
      grad.addColorStop(1, gradientTo);
      ctx!.fillStyle = grad;

      const crSq = cursorRadius * cursorRadius;
      const rad = dotRadius / 2;
      let maxOffset = 0;
      ctx!.beginPath();

      for (const d of dots) {
        const dx = mouse.x - d.ax;
        const dy = mouse.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && engagement > 0.01) {
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / cursorRadius;
          const push = t * t * bulgeStrength * engagement;
          const angle = Math.atan2(dy, dx);
          d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
          d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
        } else {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        ctx!.moveTo(d.sx + rad, d.sy);
        ctx!.arc(d.sx, d.sy, rad, 0, TWO_PI);

        const off = Math.abs(d.sx - d.ax) + Math.abs(d.sy - d.ay);
        if (off > maxOffset) maxOffset = off;
      }

      ctx!.fill();

      /*
        Cuando el cursor se para y los puntos han vuelto a su sitio, no hay nada que
        animar: se detiene el bucle en lugar de seguir repintando lo mismo. El
        siguiente movimiento del raton lo despierta.
      */
      if (engagement === 0 && maxOffset < 0.05 && glowOpacity < 0.01) {
        raf = 0;
        return;
      }

      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (!interactive || raf) return;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    doResize();

    // Solo se anima mientras el hero esta en pantalla y la pestana esta visible.
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && document.visibilityState === "visible") start();
      else stop();
    });
    observer.observe(container);

    const onVisibility = () => {
      if (document.visibilityState === "visible" && onScreen) start();
      else stop();
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    if (interactive) {
      container.addEventListener("mousemove", onMouseMove, { passive: true });
      container.addEventListener("mouseleave", onMouseLeave, { passive: true });
    }

    return () => {
      stop();
      observer.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
    /*
      `enabled` va en las dependencias y no es un detalle: sin el, este efecto
      correria una sola vez con el componente aun sin pintar, encontraria las
      referencias a `null`, saldria por la guarda de arriba y no volveria a
      ejecutarse nunca. La retícula no llegaria a aparecer en escritorio.
    */
  }, [
    enabled,
    dotRadius,
    dotSpacing,
    cursorRadius,
    bulgeStrength,
    gradientFrom,
    gradientTo,
    glowColor,
  ]);

  if (!enabled) return null;

  return (
    <div ref={containerRef} aria-hidden="true" className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={glowIdRef.current}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={`url(#${glowIdRef.current})`}
          style={{ opacity: 0, willChange: "opacity" }}
        />
      </svg>
    </div>
  );
});
