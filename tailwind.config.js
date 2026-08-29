/** @type {import('tailwindcss').Config} */

/*
  Sistema de diseno de la landing.

  Las escalas (espaciado, tipo, radios, medidas) viven aqui; los COLORES viven en
  `index.css` como variables por tema, y aqui solo se referencian. La fuente de verdad
  de todos los valores es `brand/BRAND.md`: si cambias un color, cambialo alli primero
  y luego propaga con `/app-factory:sync-design`.

  Radios alineados con `brand/BRAND.md` §7.2 el 25/08/2026: se retira el escalon de
  6px, que estaba fuera de la escala del sistema.
*/
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      /*
        BLOQUE CLARO/OSCURO - 25/08/2026.

        Los colores dejan de ser hexadecimales fijos y pasan a leer variables CSS
        (ver `index.css`, bloque "Temas"). Cada seccion de la pagina declara su tema
        con una clase (`theme-light`, `theme-light-alt` o `theme-dark`) y todas las
        variables de debajo se resuelven contra ese tema.

        El objetivo del rodeo es que NINGUN componente cambie: `bg-background`,
        `text-foreground`, `bg-card`, `text-emerald-400` y compania siguen
        escribiendose igual y ahora significan lo correcto en cada seccion. Sin esto,
        pasar la pagina a claro habria obligado a tocar los diecisiete componentes.

        El formato es un triplete de canales sin envolver ("14 15 12") y no un
        hexadecimal, porque es lo unico que deja funcionar los modificadores de
        opacidad de Tailwind: `bg-emerald-400/10` se compila a
        `rgb(var(--c-accent) / 0.1)`, y eso necesita los canales sueltos.

        Ritmo de la pagina y valores de cada tema: `brand/BRAND.md` §5 y §9.1.
      */
      colors: {
        background: "rgb(var(--c-background) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        "card-hover": "rgb(var(--c-card-hover) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        foreground: "rgb(var(--c-foreground) / <alpha-value>)",
        "text-secondary": "rgb(var(--c-text-secondary) / <alpha-value>)",
        "text-tertiary": "rgb(var(--c-text-tertiary) / <alpha-value>)",

        /*
          El acento. `emerald-400` es el acento en reposo y `emerald-300` su hover;
          en claro valen #065F46 y #047857, en oscuro #10B981 y #34D399.

          #34D399 deja de ser el acento en reposo: sobre el fondo oscuro daba 10:1,
          tanto contraste que no contrasta sino que resplandece, y ese resplandor es
          la firma visual del sector del que este producto se separa (ver `brand/BRAND.md` §5.3).
          Sobrevive solo como estado hover, que es transitorio.
        */
        emerald: {
          300: "rgb(var(--c-accent-hover) / <alpha-value>)",
          400: "rgb(var(--c-accent) / <alpha-value>)",
          500: "rgb(var(--c-accent-strong) / <alpha-value>)",
        },

        /* Rotulo en versales. En oscuro es el acento; en claro baja a texto
           terciario, porque el presupuesto de acento se gasta entero en el CTA. */
        eyebrow: "rgb(var(--c-eyebrow) / <alpha-value>)",
        /*
          El acento suave SOLIDO, para fondos de chip, icono y badge. Sustituye a
          los `bg-emerald-400/10` que en claro no pintaban nada: ver el comentario
          de `--c-accent-soft` en `index.css`.
        */
        "accent-soft": "rgb(var(--c-accent-soft) / <alpha-value>)",
        "on-accent-soft": "rgb(var(--c-accent-soft-ink) / <alpha-value>)",

        /*
          Estado, no marca: los tres estados de cobertura de la calculadora y los
          errores de formulario. Tambien cambian por tema, porque #FCA5A5 sobre
          blanco da 2,1:1 y #FBBF24 da 1,7:1: ilegibles los dos.
        */
        warning: "rgb(var(--c-warning) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",

        /*
          Paleta de los mockups de producto. Tambien por tema, y es lo que evita
          tocar `ProductMockups.tsx`: sobre fondo oscuro se mantiene la escala crema
          de siempre, que es lo que despega la ventana del negro; sobre fondo claro
          pasa a la paleta real de la plataforma (blanco + #F0F1EE), porque la crema
          sobre #F7F8F6 no se distingue del lienzo y el mockup deja de leerse como
          una captura.
        */
        mockup: {
          chrome: "rgb(var(--c-mk-chrome) / <alpha-value>)",
          dot: "rgb(var(--c-mk-dot) / <alpha-value>)",
          surface: "rgb(var(--c-mk-surface) / <alpha-value>)",
          raised: "rgb(var(--c-mk-raised) / <alpha-value>)",
          badge: "rgb(var(--c-mk-badge) / <alpha-value>)",
          ink: "rgb(var(--c-mk-ink) / <alpha-value>)",
          muted: "rgb(var(--c-mk-muted) / <alpha-value>)",
          accent: "rgb(var(--c-mk-accent) / <alpha-value>)",
        },
      },
      spacing: {
        1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px",
        6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px",
        20: "80px", 24: "96px", 32: "128px",
      },
      fontSize: {
        micro: ["11px", { lineHeight: "14px", fontWeight: "500", letterSpacing: "0.18em" }],
        caption: ["12px", { lineHeight: "18px", fontWeight: "300" }],
        /*
          Un escalon intermedio para el cuerpo de texto de las tarjetas en movil. A
          12px se leia demasiado pequeno en pantalla estrecha, pero en escritorio,
          dentro de tres columnas, 12px es la densidad correcta. Se usa como
          `text-caption-lg sm:text-caption`: mas grande donde hay poco espacio.
        */
        "caption-lg": ["14px", { lineHeight: "21px", fontWeight: "300" }],
        label: ["13px", { lineHeight: "18px", fontWeight: "500" }],
        body: ["15px", { lineHeight: "24px", fontWeight: "300" }],
        "body-lg": ["17px", { lineHeight: "27px", fontWeight: "300" }],
        title: ["20px", { lineHeight: "26px", fontWeight: "500", letterSpacing: "-0.01em" }],
        headline: ["28px", { lineHeight: "32px", fontWeight: "500", letterSpacing: "-0.02em" }],
        display: ["40px", { lineHeight: "44px", fontWeight: "500", letterSpacing: "-0.03em" }],
        "display-lg": ["56px", { lineHeight: "58px", fontWeight: "500", letterSpacing: "-0.03em" }],
        "display-xl": ["76px", { lineHeight: "78px", fontWeight: "500", letterSpacing: "-0.035em" }],
        "display-2xl": ["88px", { lineHeight: "90px", fontWeight: "500", letterSpacing: "-0.04em" }],

        /*
          ESCALA DE LOS MOCKUPS - 29/08/2026.

          Los mockups usaban la escala de la pagina, y la escala de la pagina es de
          marketing: `micro` lleva 0,18em de tracking porque nace para el rotulo en
          versales de cada seccion, y `caption` va en Light 300 porque es texto de
          lectura dentro de una tarjeta. Aplicados a los rotulos de una interfaz
          ("Capital captado", "Verificado", "Referencia de integridad") el resultado
          es un cartel, no un producto: ninguna aplicacion real espacia sus etiquetas
          de 11px como un titulo de credito.

          Esta escala es la de una UI de verdad -- tracking a cero o negativo y pesos
          de interfaz (400/500/600) -- y vive SOLO dentro de `ProductMockups.tsx`. Es
          coherente con la plataforma que retratan: la escala real esta en
          `docs/CLAUDE.md`, seccion Tipografia.
        */
        "mk-micro": ["11px", { lineHeight: "14px", fontWeight: "500", letterSpacing: "0" }],
        "mk-caption": ["12px", { lineHeight: "16px", fontWeight: "400", letterSpacing: "-0.005em" }],
        "mk-label": ["13px", { lineHeight: "18px", fontWeight: "500", letterSpacing: "-0.01em" }],
        "mk-title": ["20px", { lineHeight: "26px", fontWeight: "600", letterSpacing: "-0.02em" }],
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px", md: "12px", lg: "16px", xl: "24px", "2xl": "32px", full: "9999px",
      },
      maxWidth: {
        reading: "680px",
        shell: "1200px",
        /*
          Medida en `ch`, no en pixeles. `reading` son 680px, que a 17px de cuerpo dan
          unos 75 caracteres por linea, pero aplicados a texto de 12px dan 113, muy por
          encima de lo comodo. En `ch` la medida se ajusta sola al tamano de letra, asi
          que sirve igual para una entradilla que para una nota al pie.
        */
        measure: "68ch",
      },
      minHeight: { touch: "44px" },
    },
  },
  plugins: [],
};
