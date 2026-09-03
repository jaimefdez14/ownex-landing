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
| `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` | Analítica, host europeo. Sin clave no hay medición **ni banner de consentimiento**. |
| `VITE_CONTACT_EMAIL` | Correo de respaldo en el mensaje de fallo del formulario. |
| `VITE_LINKEDIN_URL`, `VITE_SITE_URL` | Perfil y dominio definitivo. |
| `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `NOTIFY_EMAIL` | Solo servidor: los dos correos del circuito de lead. |
| `LEAD_REGISTRY_WEBHOOK` | Registro de leads. Opcional. |

## El hub de recursos

Los artículos NO son parte de esta aplicación de React. Son HTML estático en
`public/articulos/`, con su propia hoja (`public/articulos/articulos.css`), su propia cabecera
y su propio pie, y sin una sola línea de JavaScript. La landing prerenderiza UNA sola página
(`scripts/prerender.mjs` inyecta el HTML dentro de `dist/index.html`), así que meter los
artículos dentro obligaría a montar enrutado y prerenderizado por ruta para conseguir
exactamente lo que un fichero HTML ya da gratis: una URL propia, indexable y servida entera al
primer byte.

| Ruta | Qué es |
|---|---|
| `/articulos/` | El hub: destacado, tres rejillas por categoría y navegación por chips. |
| `/articulos/<slug>.html` | La ficha del artículo: portada, índice lateral, cuerpo, preguntas frecuentes, cierre y relacionados. |
| `/articulos/portadas/*.svg` | Las ocho portadas. Son diagramas del concepto del artículo, no fotografía de banco. |
| `/articulos/articulos.css` | La hoja del hub y de la ficha. Distinta de `legal.css` a propósito. |

**Reescrito el 01/09/2026**, después de que Jaime comparase lo que teníamos con `hokenfi.com/blog`
y `reental.co/en/blog`. Antes eran dos artículos sueltos servidos con la hoja de las páginas
legales, sin índice, sin categorías, sin fecha ni tiempo de lectura, sin metadatos sociales y sin
salida al final. Un artículo con la hoja de un aviso legal parece una obligación legal, no una
publicación. Ahora son diez artículos, con `Article`, `BreadcrumbList` y `FAQPage` en JSON-LD y
tarjeta social propia.

**Auditoría de precisión, 01/09/2026.** A petición de Jaime se revisaron los diez artículos
contra fuente oficial, norma por norma. Aparecieron tres errores de fondo, ya corregidos, y todos
del mismo tipo: afirmaciones escritas de memoria que sonaban bien y no eran exactas.

| Decía | Dice ahora |
|---|---|
| Exención de folleto por debajo de ocho millones "de importe total en doce meses" | El importe total se computa **en la Unión Europea**, no solo en España (art. 35.2.b). Si la oferta llega a inversores de otros Estados miembros, todo suma contra el mismo umbral. |
| La entidad autorizada interviene "cuando la oferta se dirige a inversores minoristas" | El disparador del art. 36.1 es que la oferta exenta **se comercialice mediante publicidad al público en general**. Una campaña a tu base cae ahí, pero el motivo es otro. |
| El préstamo participativo "está regulado en el derecho español" | Art. 20 del Real Decreto-ley 7/1996, con sus tres rasgos exactos: patrimonio neto a efectos de reducción de capital y liquidación, prelación tras los acreedores comunes, y amortización anticipada solo si se compensa con ampliación de igual cuantía de fondos propios. |

Además: los nombres oficiales de las normas están completos y con fecha, el periodo de reflexión
del reglamento europeo es de cuatro días naturales, la conservación de la documentación de
diligencia debida son diez años (art. 25 de la Ley 10/2010), la elevación a escritura pública del
documento de la emisión es obligatoria para valores participativos y potestativa para los demás, y
las cifras de terceros (BrewDog, VICIO, Playtomic) van atribuidas a su fuente. La de BrewDog bajó
de "setenta y cinco millones" a "más de setenta millones" porque dos documentos internos no
coinciden y esa es la afirmación que sostienen los dos.

Cada artículo con contenido normativo cierra con un bloque **"Normas y fuentes citadas"** con el
nombre oficial, el identificador del BOE y el enlace. Los siete enlaces se comprobaron uno a uno
(devuelven 200). Un aviso, porque es fácil de repetir: **no inventes identificadores del BOE**. En
esta misma sesión se dio por buena una URL para la Ley 6/2023 que resultó ser la convocatoria de
plazas de un ayuntamiento de Girona. Se buscan y se verifican, siempre.

El único artículo sin bloque de fuentes es el de venture capital: no hace ninguna afirmación
normativa, es análisis.

**Si añades un artículo**, hay cuatro sitios que tocar y ninguno es automático (decisión
consciente: no hay pipeline de contenido en el repo):

1. `public/articulos/<slug>.html`, copiando la estructura de cualquiera de los diez.
2. La tarjeta en `public/articulos/index.html`, dentro de la rejilla de su categoría.
3. `public/sitemap.xml`.
4. `src/data/articulos.ts`, **solo si** quieres que salga en las tres tarjetas de la landing.

El vocabulario prohibido del §0 no aplica dentro de `public/articulos/` (ver la excepción en
`scripts/check-copy.mjs`): quien busca "equity crowdfunding" usa esa palabra y no se le puede
responder con una página que la evita. El resto de reglas de `npm run check:copy` sí aplican.

## QA

Sobre el build real en Chrome:

- **Sin JavaScript:** 43 de 43 bloques visibles, 10 de 10 respuestas del FAQ legibles, hero,
  formulario y pie presentes, botón de menú oculto en lugar de muerto.
- **Lighthouse móvil: Rendimiento 99, Accesibilidad 100, Buenas prácticas 100, SEO 100.**
  LCP 1,97&nbsp;s, CLS 0, TBT 0&nbsp;ms.
- Sin scroll horizontal a 390 ni a 1440&nbsp;px. Ningún objetivo táctil por debajo de 44&nbsp;px.
  Un solo `h1`, ocho `h2`.
- `npm run check:copy` en verde.
- **Hub de recursos (01/09/2026):** sin scroll horizontal a 390&nbsp;px en el hub ni en la ficha,
  las diez fichas con JSON-LD válido, los enlaces internos entre artículos y las portadas
  resueltos, y `/articulos/` servido como índice de directorio en los tres sitios: `vite dev`,
  `vite preview` y el `dist` real sobre un servidor de ficheros. Los dos primeros necesitan el
  plugin `ownex-indices-de-directorio` de `vite.config.ts`; sin él caían en el fallback de la
  aplicación y devolvían la landing con un 200, así que en desarrollo parecía que solo existían
  los tres artículos destacados. Recorrido comprobado de punta a punta: landing, "Ver los 10
  recursos publicados", hub con diez fichas en tres categorías.

### Lo que queda por verificar

- **La interacción del cursor con la retícula.** El renderizado estático está verificado (23.948
  píxeles pintados) y Lighthouse confirma que no cuesta nada al hilo principal, pero la reacción al
  mover el ratón no se pudo comprobar de forma automática: el panel de previsualización de este
  entorno mantiene la pestaña en segundo plano y ahí `requestAnimationFrame` no se ejecuta. Se ve
  al instante abriendo la página en un navegador normal.
- **El envío de prueba end to end** del circuito de lead: necesita `RESEND_API_KEY`,
  `LEAD_FROM_EMAIL` y `NOTIFY_EMAIL`, y un despliegue donde la función se ejecute.

## Pendiente de tu decisión

- **La analítica pasa a medir con cookies — 02/09/2026, decisión de Jaime.** Hasta hoy PostHog
  estaba cableado pero apagado por partida doble: sin `VITE_POSTHOG_KEY` no llegaba a cargarse, y
  aunque hubiera llegado iba con `persistence: "memory"`, `autocapture: false`,
  `capture_pageview: false` y la grabación de sesión desactivada. Se comprobó en producción: el
  sitio no hacía ni una petición a PostHog, o sea que no se estaba midiendo nada en absoluto.

  Ahora mide de verdad (páginas vistas, duración, clics, mapas de calor, profundidad de scroll,
  visitante recurrente y grabación de sesión con los campos del formulario enmascarados), y por eso
  vuelve el banner de consentimiento que la versión anterior presumía de no necesitar. Se advirtió
  el coste antes de aplicarlo: la política de cookies publicada esa misma mañana afirmaba que el
  sitio no usaba perfiles de comportamiento individual. Esa página y la de privacidad se han
  reescrito en el mismo cambio para que digan lo que el sitio hace.

  **Falta un paso que no puedo dar yo:** crear el proyecto en `eu.posthog.com` y poner la clave
  `phc_...` en Vercel como `VITE_POSTHOG_KEY`. Mientras no esté, no hay medición ni banner, y el
  sitio se comporta exactamente igual que antes.


- Los ficheros del proyecto de Lovable que no llegaron: `index.css`, `tailwind.config.ts`,
  `button.tsx` y `DotField.css`. El sistema de diseño de `tailwind.config.js` e `index.css` está
  **reconstruido por deducción** a partir del uso que hacían los componentes, y ajustado para
  cumplir contraste (el `text-tertiary` original se usaba tanto en titulares grandes como en notas
  de 11&nbsp;px, donde no llegaba a 4,5:1). Si pasas los originales, se afina.
- La familia tipográfica de los titulares. Se ha usado Inter con peso 500 y tracking cerrado. En
  `ApproachSection.tsx` (fichero que no se usa: no está en `Index.tsx` y está en inglés) aparecía
  `font-serif`, así que si el diseño que te gusta lleva serif en los display, dímelo.
- **Resuelto el 02/09/2026:** los tres textos legales dejan de ser un borrador. El titular pasa a
  ser Jaime Fernández Elegido como persona física (mismo patrón que `savryapp.com`), desaparecen
  los `[PENDIENTE]` y el aviso ámbar de documento en revisión, y la política de privacidad nombra
  a los encargados reales (Vercel, Mailchimp, PostHog) en lugar de afirmar que todos están en el
  Espacio Económico Europeo, que no era cierto. Queda pendiente **dar de alta los buzones
  `hola@ownex.co` y `privacidad@ownex.co`**: las tres páginas ya los publican, y el de privacidad
  es el canal de ejercicio de derechos del RGPD, así que tiene que recibir correo de verdad.
- NIF y domicilio del titular. Se omiten a propósito, como hace Savry, aunque el art. 10 de la LSSI
  los pide: en cuanto los pases, entran en el apartado 1 del aviso legal y en el 1 de privacidad.
