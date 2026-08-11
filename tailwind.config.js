/** @type {import('tailwindcss').Config} */

/*
  Sistema de diseno de la v2, reconstruido a partir del proyecto de Lovable.

  No me pasaste `index.css` ni `tailwind.config.ts`, asi que los valores exactos de
  `--background`, `--text-secondary`, `--text-tertiary` y `--border` estan deducidos
  del uso que hacen los componentes. Todos se han elegido ademas para cumplir el
  contraste minimo de la WCAG sobre el fondo oscuro, cosa que el original no
  garantizaba: su `text-tertiary` se usaba tanto en titulares grandes (donde basta
  3:1) como en notas al pie de 11px (donde hacen falta 4,5:1).

  El acento es `emerald-400` (#34D399), que es exactamente el mismo valor que ya
  usaba la v1 como acento sobre fondo oscuro. Es la unica continuidad de color entre
  las dos versiones.
*/
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0B0C",
        card: "#101113",
        "card-hover": "#15171A",
        border: "#22252A",
        foreground: "#F5F6F7",
        "text-secondary": "#9CA0A6",
        "text-tertiary": "#868C93",
        emerald: {
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
        },
        /*
          Colores de estado, no de marca. Existen solo para los tres estados de
          cobertura de la calculadora (§2.4) y para los mensajes de error de los
          formularios, que hasta ahora llevaban el rojo escrito a mano en cada
          sitio (`text-[#FCA5A5]`).

          No tocan el acento: el esmeralda sigue siendo el unico color de marca y
          el unico que aparece cuando todo va bien. Estos dos solo se encienden
          cuando hay algo que decir, que es lo que los hace legibles como senal.

          Contraste sobre el fondo (#0A0B0C) y sobre la tarjeta (#101113): ambos
          por encima de 8:1, muy holgados para el minimo de 4,5:1 de la WCAG.
        */
        warning: "#FBBF24",
        danger: "#FCA5A5",
        /*
          Paleta de los mockups de producto. Son ventanas de una interfaz clara sobre
          la pagina oscura, asi que necesitan su propia escala: es lo que las separa
          del lienzo y las hace leer como una captura.

          Estaba escrita como hexadecimales sueltos repartidos por el componente, y
          `muted` era #6B6E68, que daba 4,09:1 sobre `raised` y 3,52:1 sobre `badge`,
          por debajo del minimo de 4,5:1. Se ha oscurecido hasta 5,7:1 y 4,9:1.
        */
        mockup: {
          chrome: "#E8E8E1",
          dot: "#B4B4A8",
          surface: "#F7F7F2",
          raised: "#EDEDE6",
          badge: "#DDDDD3",
          ink: "#141410",
          muted: "#5A5D57",
          /*
            Verde para texto sobre las superficies claras del mockup. `emerald-600`
            daba 3,20:1 sobre `raised`, por debajo del 4,5:1 que necesita un rotulo
            de 11px. Este da 6,5:1, y ademas es el mismo esmeralda que usaba la v1.
          */
          accent: "#065F46",
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
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px", md: "8px", lg: "12px", xl: "16px", "2xl": "24px", full: "9999px",
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
