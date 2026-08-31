import { useEffect, useRef } from "react";

/**
 * Campo de olas en WebGL, de fondo. Adaptado del componente `GradientWaves` de
 * React Bits (variante JS+CSS, dependencia `ogl`) que pidio Jaime el 30/08/2026
 * para la seccion de la tesis, con cuatro cambios respecto al original:
 *
 *   1) TIPADO y props en TypeScript, como el resto de `src/components`.
 *   2) `ogl` se carga con `import()` DENTRO del efecto. El original lo importa
 *      arriba, y eso lo mete en el bundle de servidor del prerender
 *      (`vite build --ssr`) y en el JavaScript de la primera pantalla. Aqui la
 *      libreria (~50kB) no se descarga hasta que el componente se monta en el
 *      navegador, y el HTML prerenderizado no la necesita para nada: sin
 *      JavaScript la seccion es exactamente lo que era, negro plano.
 *   3) MOVIMIENTO REDUCIDO (regla 16 del proyecto): con
 *      `prefers-reduced-motion: reduce` se pinta UN fotograma y no se arranca el
 *      bucle. No desaparece -- la textura sigue estando, que es su trabajo -- pero
 *      no se mueve, y con ella se desactiva tambien el parallax del puntero.
 *   4) GUARDA DE WebGL2. El fragmento es GLSL ES 3.00 (`#version 300 es`), asi
 *      que sin WebGL2 no compila. En vez de dejar que reviente en consola, se
 *      comprueba antes y, si no hay, no se monta nada.
 *
 * Del original se conservan intactos los dos shaders, el raymarch del plasma y la
 * economia de dibujo: `ResizeObserver` para el tamano, `IntersectionObserver` para
 * no gastar GPU con la seccion fuera de pantalla y `visibilitychange` para parar
 * con la pestana en segundo plano.
 */

type Detail = "low" | "medium" | "high";

export type GradientWavesProps = {
  /** Color de la bruma del horizonte, al que se funden las olas al alejarse. */
  horizonColor?: string;
  /** Color del cuerpo de las olas. */
  waveColor?: string;
  /** Color de la cresta de las olas cercanas. */
  crestColor?: string;
  speed?: number;
  amplitude?: number;
  waveScale?: number;
  waveRatio?: number;
  swell?: number;
  turbulence?: number;
  /** Inclinacion de la camara hacia el horizonte, en radianes. */
  tilt?: number;
  zoom?: number;
  /** Desplazamiento vertical de la linea del horizonte. */
  height?: number;
  /** Distancia en la que las olas se funden con la bruma y se vuelven transparentes. */
  fogDepth?: number;
  /** Calidad del raymarch: 40, 70 o 110 pasos. */
  detail?: Detail;
  brightness?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  parallaxStrength?: number;
  grain?: boolean;
  grainIntensity?: number;
  className?: string;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const detailToSteps = (detail: Detail) => {
  if (detail === "low") return 40.0;
  if (detail === "high") return 110.0;
  return 70.0;
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

/* Handle que el efecto de montaje deja para el efecto de props: el programa de
   shaders vive fuera de React (lo crea `ogl`), asi que se guarda en una ref. */
type WavesHandle = {
  program: { uniforms: Record<string, { value: any }> };
  render: () => void;
};

export function GradientWaves({
  horizonColor = "#5227FF",
  waveColor = "#FF9FFC",
  crestColor = "#FFFFFF",
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  waveRatio = 0.9,
  swell = 35,
  turbulence = 20,
  tilt = 1.11,
  zoom = 1.0,
  height = 5.5,
  fogDepth = 15,
  detail = "medium",
  brightness = 1.0,
  opacity = 1.0,
  mouseInteraction = true,
  parallaxStrength = 0.5,
  grain = true,
  grainIntensity = 0.05,
  className = "",
}: GradientWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<WavesHandle | null>(null);
  const enableMouseRef = useRef(mouseInteraction);

  /*
    Las props se guardan tambien en una ref para poder aplicarlas en cuanto el
    `import()` de `ogl` resuelve. El efecto de montaje no las puede leer de su
    closure (se quedarian congeladas en el primer valor) y el efecto de props
    puede haber corrido ya, con el programa todavia sin existir.
  */
  const propsRef = useRef<GradientWavesProps>({});
  propsRef.current = {
    horizonColor, waveColor, crestColor, speed, amplitude, waveScale, waveRatio,
    swell, turbulence, tilt, zoom, height, fogDepth, detail, brightness, opacity,
    mouseInteraction, parallaxStrength, grain, grainIntensity,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* GLSL ES 3.00: sin WebGL2 no hay nada que hacer. */
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) return;
    probe.getExtension("WEBGL_lose_context")?.loseContext();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let cleanup = () => {};

    /*
      El `.catch` del final de esta cadena no es decorativo: sin el, un fallo al
      descargar el trozo de `ogl` (una red que se cae a mitad de la primera visita)
      sale por consola como promesa no capturada. Aqui no hay nada que hacer al
      respecto y tampoco hace falta: la degradacion ya es correcta -- la seccion se
      queda en negro plano, que es exactamente lo que se ve sin JavaScript -- asi
      que se traga el error a proposito en vez de ensuciar la consola de produccion.
    */
    import("ogl").then(({ Renderer, Program, Mesh, Triangle }) => {
      if (disposed) return;

      const renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });

      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      container.appendChild(canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uSpeed: { value: 0.4 },
          uAmplitude: { value: 2.5 },
          uWaveScale: { value: 0.6 },
          uWaveRatio: { value: 0.9 },
          uSwell: { value: 35 },
          uTurbulence: { value: 20 },
          uTilt: { value: 1.11 },
          uZoom: { value: 1.0 },
          uHeight: { value: 5.5 },
          uFogDepth: { value: 15 },
          uSteps: { value: 70.0 },
          uBrightness: { value: 1.0 },
          uOpacity: { value: 1.0 },
          uGrain: { value: 1.0 },
          uGrainIntensity: { value: 0.05 },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uParallax: { value: 0.5 },
          uEnableMouse: { value: true },
          uHorizonColor: { value: new Float32Array([1, 1, 1]) },
          uWaveColor: { value: new Float32Array([1, 1, 1]) },
          uCrestColor: { value: new Float32Array([1, 1, 1]) },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      const render = () => renderer.render({ scene: mesh });
      handleRef.current = { program: program as unknown as WavesHandle["program"], render };

      applyProps(handleRef.current, propsRef.current, enableMouseRef);

      const setSize = () => {
        const rect = container.getBoundingClientRect();
        renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
        const res = program.uniforms.iResolution.value as Float32Array;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
        render();
      };

      const ro = new ResizeObserver(setSize);
      ro.observe(container);
      setSize();

      const currentMouse = [0.5, 0.5];
      const targetMouse = [0.5, 0.5];

      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        targetMouse[0] = (e.clientX - rect.left) / rect.width;
        targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
      };
      const onPointerLeave = () => {
        targetMouse[0] = 0.5;
        targetMouse[1] = 0.5;
      };
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);

      let raf = 0;
      let isVisible = true;
      let isPageVisible = !document.hidden;
      const t0 = performance.now();

      const loop = (t: number) => {
        program.uniforms.iTime.value = (t - t0) * 0.001;
        const tx = enableMouseRef.current ? targetMouse[0] : 0.5;
        const ty = enableMouseRef.current ? targetMouse[1] : 0.5;
        currentMouse[0] += 0.05 * (tx - currentMouse[0]);
        currentMouse[1] += 0.05 * (ty - currentMouse[1]);
        const m = program.uniforms.uMouse.value as Float32Array;
        m[0] = currentMouse[0];
        m[1] = currentMouse[1];
        render();
        raf = requestAnimationFrame(loop);
      };

      const tryStart = () => {
        /* Con movimiento reducido el fotograma que ya pinto `setSize` es el final. */
        if (reducedMotion) return;
        if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
      };
      const tryStop = () => {
        if (raf !== 0) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          isVisible ? tryStart() : tryStop();
        },
        { threshold: 0 },
      );
      io.observe(container);

      const onVisibility = () => {
        isPageVisible = !document.hidden;
        isPageVisible ? tryStart() : tryStop();
      };
      document.addEventListener("visibilitychange", onVisibility);

      tryStart();

      cleanup = () => {
        tryStop();
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        handleRef.current = null;
        try {
          container.removeChild(canvas);
        } catch {
          /* el nodo ya no estaba: nada que deshacer */
        }
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }).catch(() => {
      /* Sin olas. La seccion se queda como sin JavaScript: negro plano. */
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  /* Cambio de props en caliente: escribe los uniforms, sin recrear el programa. */
  useEffect(() => {
    if (!handleRef.current) return;
    applyProps(handleRef.current, propsRef.current, enableMouseRef);
    handleRef.current.render();
  });

  return <div ref={containerRef} className={`gradient-waves-container ${className}`.trim()} />;
}

function applyProps(
  handle: WavesHandle,
  p: GradientWavesProps,
  enableMouseRef: { current: boolean },
) {
  const u = handle.program.uniforms;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = (p.mouseInteraction ?? true) && !reducedMotion;

  enableMouseRef.current = mouse;

  u.uSpeed.value = p.speed ?? 0.4;
  u.uAmplitude.value = p.amplitude ?? 2.5;
  u.uWaveScale.value = p.waveScale ?? 0.6;
  u.uWaveRatio.value = p.waveRatio ?? 0.9;
  u.uSwell.value = p.swell ?? 35;
  u.uTurbulence.value = p.turbulence ?? 20;
  u.uTilt.value = p.tilt ?? 1.11;
  u.uZoom.value = p.zoom ?? 1.0;
  u.uHeight.value = p.height ?? 5.5;
  u.uFogDepth.value = p.fogDepth ?? 15;
  u.uSteps.value = detailToSteps(p.detail ?? "medium");
  u.uBrightness.value = p.brightness ?? 1.0;
  u.uOpacity.value = p.opacity ?? 1.0;
  u.uGrain.value = (p.grain ?? true) ? 1.0 : 0.0;
  u.uGrainIntensity.value = p.grainIntensity ?? 0.05;
  u.uParallax.value = p.parallaxStrength ?? 0.5;
  u.uEnableMouse.value = mouse;

  const write = (target: Float32Array, hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    target[0] = r;
    target[1] = g;
    target[2] = b;
  };
  write(u.uHorizonColor.value as Float32Array, p.horizonColor ?? "#5227FF");
  write(u.uWaveColor.value as Float32Array, p.waveColor ?? "#FF9FFC");
  write(u.uCrestColor.value as Float32Array, p.crestColor ?? "#FFFFFF");
}

export default GradientWaves;
