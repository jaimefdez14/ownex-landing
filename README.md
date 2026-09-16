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
| `npm run og` | Regenera las dos tarjetas sociales (`og-image.png` y `og-image-en.png`). |

## Dos idiomas: español en `/` e inglés en `/en/`

Desde el **16/09/2026** el sitio se publica en los dos idiomas. Lo que hay que saber para tocarlo:

- **El idioma lo decide la URL, y solo ella.** `/` es español, `/en/` es inglés. No hay redirección
  por `Accept-Language` a propósito: una redirección automática esconde una de las dos versiones al
  rastreador (que llega sin preferencia) y le quita al visitante la versión que ha pedido al pegar
  un enlace. El `hreflang` del `<head>` es lo que le dice al buscador cuál servir a quién.
- **Las dos landings se prerrenderizan en el build.** `scripts/prerender.mjs` escribe
  `dist/index.html` y `dist/en/index.html` con la misma plantilla compilada, reescribiendo `lang`,
  título, descripción, canónica y las etiquetas de Open Graph y Twitter con los valores de
  `src/i18n/head.ts`, más los `hreflang` recíprocos. **Si una de esas etiquetas no aparece en la
  plantilla, el build falla**: una página inglesa con la descripción en español no avisa de nada y
  se queda así en los buscadores.
- **El copy vive junto al componente que lo pinta**, en un objeto `COPY = { es, en }`. Se eligió eso
  y no un diccionario central para que los comentarios que explican cada decisión de redacción
  sigan pegados a la frase que explican, que es medio repositorio.
- **Las cifras cambian de formato con el idioma** (`src/lib/formatNumber.ts`, vía `useFormat()`):
  en español punto de millar, coma decimal y espacio duro antes del símbolo (`150.000 €`); en
  inglés coma de millar, punto decimal y el símbolo del euro delante y pegado (`€150,000`). En
  inglés ese formato no es estilo, es corrección: `150.000 €` se lee como ciento cincuenta euros
  mal escritos.
- **Los identificadores no se traducen.** Las anclas de sección (`#contact`, `#faq`), los `id` de
  las preguntas y los valores que viajan a analítica se quedan en su forma original, para que el
  mismo botón no cuente como dos en cada embudo. Lo que separa las dos versiones es la propiedad
  `idioma`, que va en todos los eventos, y la etiqueta del mismo nombre en el lead.
- **Páginas estáticas:** las inglesas viven en `public/en/` con slugs en inglés
  (`/en/legal-notice.html`, `/en/privacy.html`, `/en/cookies.html`, `/en/articles/`). Los tres
  textos legales dicen en su cabecera que **la versión que manda es la española**, porque están
  redactados sobre normativa española y publicar una traducción sin decirlo crea la ambigüedad que
  un aviso legal existe para evitar.
- **Los artículos ingleses se generan de un molde.** El envoltorio (cabecera, barra, hero, índice,
  banda de CTA, "seguir leyendo" y pie) y los datos estructurados salen de un generador, y a mano
  solo se escribe el cuerpo traducido. El índice de la página y el `FAQPage` se derivan del propio
  cuerpo (de los `<h2 id>` y de los `<details>`), así que no pueden desincronizarse del texto.
- **El conmutador** (`src/components/LanguageSwitch.tsx` en la landing, `.bar-lang` en las páginas
  estáticas) son enlaces con `hreflang`, no botones: cambiar de idioma es cambiar de página, y así
  funciona sin JavaScript y se puede abrir en otra pestaña. Con JavaScript conserva el fragmento,
  así que quien cambia de idioma leyendo las preguntas frecuentes aterriza en las preguntas
  frecuentes del otro idioma.

**Los dos hubs publican los mismos 16 artículos**, emparejados uno a uno con `hreflang` recíproco.
`TOTAL_RECURSOS` (`src/data/articulos.ts`) sigue siendo una cifra por idioma: si se publica un
artículo solo en español, sube únicamente la española y su enlace "EN" apunta a `/en/` hasta que
exista la traducción.

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

## El simulador: dos modalidades

Desde el 04/09/2026 la calculadora de `#calculator` responde en dos modalidades y se pasa
de una a otra con el conmutador de la cabecera de la tarjeta.

| | Equity | Deuda |
|---|---|---|
| Pregunta, ademas de inversores y ticket | valoracion pre-money | cupon **fijo**, tramo **variable** y plazo |
| Responde | capital captable, coste estimado, dilucion | capital captable, coste de estructurar, coste efectivo anual |
| Modelo | `src/lib/capitalEstimate.ts` | `src/lib/debtEstimate.ts` |
| Grafica | coste de estructurar segun el capital | coste total de la financiacion durante el plazo |

El cupon de la deuda va SIEMPRE partido en dos: un tramo fijo, que la marca paga pase lo que
pase, y un tramo variable ligado al desempeno. Eso es lo que hace que la horquilla del coste
signifique algo: su suelo supone que solo se paga el fijo y su techo que se paga tambien el
variable entero. Los valores de partida (fijo 5 %, variable 3 %) estan calibrados contra cinco
emisiones reales bajo el mismo envoltorio juridico y contra ENISA; el analisis vive en
`CLAUDE OUTPUTS/.../03_Financiero/OwnEX_Comparables-Cupones-Deuda_v1.md`.

Las dos horquillas salen de la hoja `Supuestos` y de la pestana `Cliente-Deuda` de
`OwnEX_Modelo-Financiero_v1.xlsx`, que es la unica fuente de verdad financiera. Ninguna
pantalla publica el desglose por partidas: eso sigue viajando solo en el correo que recibe
el lead. El porque de cada numero, y que se aparta a proposito del modelo, esta en el
docblock de cada uno de esos dos ficheros.

Lo que cambia en el circuito de lead: el envio lleva ahora un campo `modalidad`
(`"equity"` o `"deuda"`), que `api/lead.ts` valida contra una lista blanca, guarda en el
registro y manda a Mailchimp **como etiqueta**. Se eligio etiqueta y no merge field a
proposito: las etiquetas se crean solas la primera vez que se usan, asi que segmentar una
campana por instrumento no exige tocar nada en la audiencia.

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
