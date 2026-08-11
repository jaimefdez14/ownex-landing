# Ownex · landing pública (v2)

Réplica del diseño que Jaime construyó en Lovable, sobre la base técnica de la v1.

- **v1 congelada** en `../ownex-landing-v1`, con su propio commit de git. Sigue siendo
  funcional: tema claro, registro neutro, Lighthouse 99/100/100/100.
- **v2** (este repositorio): tema oscuro, retícula de puntos reactiva al cursor, tarjetas
  translúcidas y copy en tuteo.

## Stack

Vite + React 18 + TypeScript + Tailwind. Iconos de `lucide-react`. Inter autoalojada (pesos 300,
400, 500 y 600). El HTML se **prerrenderiza en el build** y el navegador solo lo hidrata.

```bash
npm install && npm run build && npm run preview
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Compila, prerrenderiza e inyecta la página completa en `dist/index.html`. |
| `npm run preview` | Sirve `dist/`. Es el build real: úsalo para QA y Lighthouse. |
| `npm run typecheck` | Comprobación de tipos. |
| `npm run check:copy` | Comprobaciones automáticas de vocabulario y microtipografía. |
| `npm run lighthouse` | Informe de Lighthouse en móvil. |

## Qué se replicó del proyecto de Lovable

Estructura de nueve secciones (`Navbar`, `HeroSection`, `ProblemSection`, `PrincipleSection`,
`SolutionSection`, `FrameworkSection`, `RegulationSection`, `ExamplesSection`, `FAQSection`,
`FooterCTA`), el `DotField`, la retícula de fondo, la viñeta radial, las `glass-card` con borde
esmeralda al pasar el cursor, los titulares a dos tonos, las fichas de icono, la comparación
enfrentada con el chip «vs», y el copy, **literal y en tuteo**, con las excepciones de abajo.

### Copy: decisión de Jaime

El §0 del brief exigía registro neutro sin tuteo y «propietario» como término principal. Jaime
decidió adoptar el copy de Lovable tal cual: **tuteo y «accionista»**. Es una decisión consciente,
no un descuido. En consecuencia, `scripts/check-copy.mjs` ha dejado de vigilar el tuteo y el
imperativo de segunda persona. **Todo lo demás sigue vigilado**, incluido el vocabulario prohibido
del §0, que no se ha tocado.

## Lo que no se replicó, y por qué

Cuatro cosas del original no eran cuestión de gusto:

1. **El régimen piloto europeo de infraestructuras de mercado.** `RegulationSection` mostraba una
   ficha con ese régimen y afirmaba que cada emisión cumple «con la normativa europea». Ese régimen
   no gobierna esta operación, así que citarlo es una afirmación regulatoria que no se sostiene, y
   además su nombre contiene una de las siglas que el §0 prohíbe. La ficha se sustituye por la que
   sí describe el reparto real de responsabilidades (ESI y ERIR), y la normativa se nombra por lo
   que es: la española, que transpone MiFID II.
2. **Las dos menciones a una categoría de activos prohibida por el §0** en la pregunta 7 del FAQ,
   una en el enunciado y otra para negarla en la respuesta. Se reformula sin nombrarla: introducir
   el concepto para desmentirlo es justo lo que esa regla quiere evitar.
3. **El formulario no enviaba nada.** Su `handleSubmit` hacía `setSubmitted(true)` y punto: sin
   destino, sin validación, sin estado de error, sin protección contra robots y sin correo de
   confirmación. Se le ha conectado el circuito real de la v1 (`api/lead.ts`): POST al endpoint,
   campo trampa, descarte de envíos instantáneos, validación con mensajes propios, aviso interno y
   correo de confirmación al lead. Se conserva además el campo **Marca**, que el original no tenía
   y del que dependen el asunto del aviso interno y el correo de confirmación.
4. **Sin JavaScript, la página original era un folio en blanco.** Todos los `motion` de
   framer-motion llevaban `initial={{ opacity: 0 }}`, que se escribe como estilo en línea desde el
   primer render. Aquí el mismo gesto (desvanecido con 32&nbsp;px de desplazamiento, escalonado por
   índice) se hace con CSS mediante el componente `Reveal`: el estado base es visible y el oculto
   solo existe bajo `html.js`. **Verificado: 43 de 43 bloques visibles sin JavaScript**, las diez
   respuestas del FAQ abiertas, y hero, formulario y pie presentes.

Además: el icono de moneda del hero pasa a `Landmark` (el §0 descarta la iconografía de monedas),
los rótulos «Cómo Funciona» y «Casos de Uso» llevan mayúscula solo en la primera palabra,
«whitelabel» pasa a «en marca blanca», y los importes y porcentajes llevan espacio duro. El pie
gana los tres textos legales y el aviso de que la web no constituye una oferta de valores, que en
España son obligatorios y el original no tenía.

## El `DotField`

Portado a TypeScript desde `DotField.jsx`, con cinco cambios, todos por el mismo motivo: el
original mantenía un bucle de animación y un temporizador corriendo de forma permanente en todos
los dispositivos.

- **No se anima en dispositivos táctiles** (`pointer: fine`). El efecto lo dirige el cursor, así
  que en un móvil no tiene nada que hacer: se pinta la retícula quieta y no se arranca ningún
  bucle. Esto por sí solo llevó el TBT de **3.250&nbsp;ms a 0&nbsp;ms** y el Rendimiento de
  **69 a 99** en Lighthouse móvil.
- **Se detiene en reposo.** Cuando el cursor se para y los puntos vuelven a su sitio, el bucle se
  corta en lugar de repintar lo mismo 60 veces por segundo. El siguiente movimiento lo despierta.
- **Se detiene** cuando el hero sale de pantalla y cuando la pestaña pasa a segundo plano.
- El `setInterval` de 20&nbsp;ms que medía la velocidad del ratón se integró en el propio bucle.
- El `mousemove` global pasa a ser local al contenedor.
- Siempre pinta un fotograma en reposo al montar, así que el lienzo nunca queda vacío aunque la
  página se cargue en una pestaña de fondo.

## Variables de entorno

Copia `.env.example` a `.env`. Ninguna es obligatoria para compilar: lo que falta no se pinta.

| Variable | Para qué |
|---|---|
| `VITE_FORM_ENDPOINT` | Destino del formulario. Por defecto `/api/lead`. |
| `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` | Analítica, host europeo, sin cookies. |
| `VITE_CONTACT_EMAIL` | Correo de respaldo en el mensaje de fallo del formulario. |
| `VITE_LINKEDIN_URL`, `VITE_SITE_URL` | Perfil y dominio definitivo. |
| `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `NOTIFY_EMAIL` | Solo servidor: los dos correos del circuito de lead. |
| `LEAD_REGISTRY_WEBHOOK` | Registro de leads. Opcional. |

## QA

Sobre el build real en Chrome:

- **Sin JavaScript:** 43 de 43 bloques visibles, 10 de 10 respuestas del FAQ legibles, hero,
  formulario y pie presentes, botón de menú oculto en lugar de muerto.
- **Lighthouse móvil: Rendimiento 99, Accesibilidad 100, Buenas prácticas 100, SEO 100.**
  LCP 1,97&nbsp;s, CLS 0, TBT 0&nbsp;ms.
- Sin scroll horizontal a 390 ni a 1440&nbsp;px. Ningún objetivo táctil por debajo de 44&nbsp;px.
  Un solo `h1`, ocho `h2`.
- `npm run check:copy` en verde.

### Lo que queda por verificar

- **La interacción del cursor con la retícula.** El renderizado estático está verificado (23.948
  píxeles pintados) y Lighthouse confirma que no cuesta nada al hilo principal, pero la reacción al
  mover el ratón no se pudo comprobar de forma automática: el panel de previsualización de este
  entorno mantiene la pestaña en segundo plano y ahí `requestAnimationFrame` no se ejecuta. Se ve
  al instante abriendo la página en un navegador normal.
- **El envío de prueba end to end** del circuito de lead: necesita `RESEND_API_KEY`,
  `LEAD_FROM_EMAIL` y `NOTIFY_EMAIL`, y un despliegue donde la función se ejecute.

## Pendiente de tu decisión

- Los ficheros del proyecto de Lovable que no llegaron: `index.css`, `tailwind.config.ts`,
  `button.tsx` y `DotField.css`. El sistema de diseño de `tailwind.config.js` e `index.css` está
  **reconstruido por deducción** a partir del uso que hacían los componentes, y ajustado para
  cumplir contraste (el `text-tertiary` original se usaba tanto en titulares grandes como en notas
  de 11&nbsp;px, donde no llegaba a 4,5:1). Si pasas los originales, se afina.
- La familia tipográfica de los titulares. Se ha usado Inter con peso 500 y tracking cerrado. En
  `ApproachSection.tsx` (fichero que no se usa: no está en `Index.tsx` y está en inglés) aparecía
  `font-serif`, así que si el diseño que te gusta lleva serif en los display, dímelo.
- Textos legales, aviso de no oferta de valores, correo de contacto y dominio definitivo.
