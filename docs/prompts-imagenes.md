# Prompts de imagen — fotos de sector y assets pendientes

> **EN PAUSA DESDE EL 31/08/2026.** El hueco de foto de sector se retiró ese día
> (primero las fotos, después la columna entera con su motivo de reserva), así que
> generar estas imágenes hoy no las pondría en ninguna parte: habría que reponer
> antes el mecanismo. Ver `src/assets/sectores/README.md`.
>
> Y este documento está escrito para **seis** sectores; desde el 31/08 quedan
> **cuatro**: se retiraron bebidas, belleza y clubes. Los prompts, el casting y los
> textos alternativos de esos tres sobran.

Cuarta versión, 31/08/2026. Las tres anteriores no valían: bodegones sin gente,
después retrato documental con luz de ventana (blando), después flash directo (oscuro
y sucio). **Lo que hace falta: lifestyle premium — luminoso, con color, gente guapa y
real trabajando en espacios bonitos, y un personaje distinto en cada foto.**

Las instrucciones de formato y de enchufe viven en `src/assets/sectores/README.md`.
Este fichero vive aquí y no junto a las fotos porque `check:copy` recorre `src/` en
busca de vocabulario prohibido, y los negativos de estos prompts lo contienen a
propósito.

---

## 0 · La restricción que manda: dónde puede estar la cara

El mismo fichero se recorta distinto en cada tamaño (`.sector-art` en `index.css`):

| Ancho | Hueco | Qué se ve de la foto |
|---|---|---|
| ≥ 1024 px | 3:2 | **entera**, cero recorte |
| 640–1023 px | 5:2 | la franja central: del 20 % al 80 % de la altura |
| < 640 px | 16:5 | una banda fina: del 27 % al 73 % de la altura |

**Los ojos del sujeto van al centro vertical del cuadro** (45–55 % de la altura), no en
el tercio superior como pide el instinto fotográfico. Un plano americano clásico, con la
cabeza arriba, pierde la cara en móvil y deja una banda de torsos. Es lo único del
prompt que no se negocia.

Si una foto ya generada tiene la cara alta, se recupera sin volver a generarla: `focus`
en el sector correspondiente mueve la banda (sintaxis de `object-position`).

---

## 1 · Espina de estilo

Va delante de cada prompt de sector. Es lo que hace que las seis parezcan una campaña y
no seis fotos sueltas. No cambiarla entre prompts.

```
Bright premium lifestyle photograph of a small-business owner in their own space,
in the visual language of a contemporary lifestyle brand campaign. High-key
natural daylight, large soft light from a window or an open shopfront, luminous
and airy, clean open shadows, nothing murky or dim. Rich clean colour: warm skin,
fresh greens, sunlit whites, pale wood, a touch of terracotta. Alive and in
motion: a real gesture mid-action, an unforced laugh or a warm half-smile in
conversation with someone just off frame. Aspirational but grounded, a beautiful
well-kept small business with plants and good light, styled but believable.
35mm, shallow depth of field, crisp modern digital capture, gentle film-like
colour grade, clean skin texture, no heavy grain.
Spain, southern European daylight. Real clothes, well styled, contemporary.
One fresh deep-emerald accent (#047857) in the clothing or the props.
COMPOSITION: eyes at the vertical centre of the frame, generous bright space to
the left and right, nothing important in the top or bottom third.
No text, no logos, no brand names, no readable signage.
Aspect ratio 3:2, 1500x1000.
```

Negativo, común a las seis:

```
no dark or dim scene, no murky shadows, no harsh on-camera flash, no grunge, no
dirty or cluttered background, no muddy desaturated colour, no beige stock
photography, no corporate suit, no thumbs up, no handshake, no crossed-arms hero
pose, no posed toothy grin at camera, no white studio background, no text, no
watermark, no logos, no crypto imagery, no blockchain motifs, no 3D coins, no
charts or graphs, no laptop dashboards, no HDR, no vignette, no plastic
over-retouched skin, no identical-looking models
```

---

## 2 · Casting: seis personas distintas

Genera cada foto por separado y **pega su línea de casting dentro del prompt**. Sin esto
los generadores devuelven seis veces la misma cara de treintañera castaña, y la sección
entera se cae: son seis negocios distintos, no seis fotos del mismo.

```
moda           A woman in her early thirties, deep brown skin, dark curly hair
               pinned up, gold hoop earrings, relaxed tailored clothes.

restauracion   A man in his fifties, olive skin, close-cropped grey hair and a
               short grey beard, rolled shirtsleeves and a dark green apron.

wellness       A woman in her forties, fair skin, short ash-blonde hair, athletic
               build, no makeup.

bebidas        A man in his thirties, light brown skin, shoulder-length dark hair
               tucked behind the ears, clear glasses, linen shirt.

belleza        A woman in her late twenties, dark skin, long braids, small gold
               jewellery, sleeveless top.

clubes         A man in his forties, tanned, thick curly brown hair, broad build,
               technical jacket.
```

---

## 3 · Los seis sectores

Espina de estilo + línea de casting + una de estas escenas. El nombre del fichero es el
`id` del sector en `src/components/ExamplesSection.tsx`.

```
moda.webp          In her own sunlit studio with white walls and hanging plants,
                   holding up a knit garment to the light and laughing at something
                   said off frame. A rail of clothes glowing behind her.

restauracion.webp  In his own bright dining room before service, big windows and
                   greenery, sliding a finished plate onto the pass and talking to
                   someone off frame, sunlight across the tables.

wellness.webp      In her airy studio with a pale wood floor and tall windows,
                   mid-instruction with one arm raised, sunlight pouring in, an
                   empty bright class space behind her.

bebidas.webp       On the sunlit terrace of his small production room, pouring from
                   an unlabelled bottle into a tasting glass, backlit glassware
                   catching the light.

belleza.webp       In her bright salon with marble, terrazzo and plants, mid-gesture
                   handing a small amber bottle across the counter, mirrors bouncing
                   daylight around her.

clubes.webp        On a sunny pitch on a clear morning, mid-clap and calling out to
                   his players, bright kit, green grass, warm low sun.
```

**`otros` no lleva foto.** Esa ficha dice justamente que la lógica no depende del
sector, y ponerle una imagen de algo la vuelve a atar a un sector.

**Variante con clientes.** La tesis de la página es que el cliente pasa a ser
propietario: si alguna foto se queda sola, cambia la escena por el empresario *con un
cliente delante* — el cliente de espaldas o de perfil, la cara del empresario siempre
visible. Funciona sobre todo en `restauracion`, `belleza` y `clubes`. Nunca más de dos
personas: a 300 px de ancho, tres cabezas son ruido.

### Lo que hay que vigilar en este registro

**La frontera con el banco de imágenes es la sonrisa.** Luminoso + gente guapa +
sonrisa a cámara es exactamente el cliché que queremos evitar. Por eso todas las escenas
son *mid-action* y hablando con alguien fuera de cuadro: la sonrisa existe pero está
dirigida a una persona, no al objetivo. Si una foto sale posada, no bajes la luz —
cambia el gesto.

**Genera las seis con el mismo tipo de luz** (día grande y suave, sin sol duro
directo salvo en `clubes`, donde el sol bajo es la escena). Lo que une la serie es la
luz, porque los espacios y las personas son distintos a propósito.

### Textos alternativos

El `alt` describe la FOTO, no el sector, y vive en `ExamplesSection.tsx` (`image.alt`).
Los tres que ya estaban escritos describen los bodegones de la primera versión:
**hay que reescribirlos** cuando entren estas fotos.

| Sector | Qué hay hoy | Qué hacer |
|---|---|---|
| `moda` | "Jersey de punto verde oscuro doblado sobre lino claro…" | reescribir: describe a la persona y su gesto |
| `restauracion` | "Plato de cerámica con una servilleta…" + `focus: "center 72%"` | reescribir el `alt` y **quitar el `focus`**: estaba calibrado para que se viera el plato, que caía bajo. Con una persona, ese 72 % corta por el pecho |
| `wellness` | "Toalla enrollada y una mancuerna…" | reescribir |
| `bebidas`, `belleza`, `clubes` | sin bloque `image` | añadir `image: { alt: … }` al generar la foto |

---

## 4 · Avatares de las bolitas

Sin cambios, y el motivo no es de estilo sino de tamaño: **miden 20×20 px**. Una cara
fotográfica ahí es una mancha. Y en el panel de accionistas esas bolitas van junto a
nombres inventados (Marta Solé, Laia Ferrer): cara generada + nombre propio se lee como
clientela ficticia, que es distinto de ilustrar un sector.

```
Flat vector avatar portrait, extreme simplification, single human silhouette from
the shoulders up, no facial features at all, solid two-tone fill: muted sage green
figure on a warm cream circle. Centered, generous margin, readable at 20 pixels.
Minimal geometric style. No text, no outline, no gradient, no shadow.
Output 96x96 PNG, transparent background outside the circle.
```

Genera 6-8 variando el fondo entre `#A5EBC7`, `#E3F0E8`, `#F0F1EE` y la silueta entre
`#04543E` y `#5C6A61`.

---

## 5 · Assets que faltan (no son fotos de sector)

**`public/og-image.png` (1200×630) — la más urgente.** La que hay es de la versión
oscura y no lleva el logo nuevo; es lo que se ve al compartir ownex.co en WhatsApp o
LinkedIn (`index.html`, `og:image`). **No generar con IA**: es tipografía + logo, sale
más nítida construida en HTML y exportada a PNG.

**Portadas de los dos artículos** (1200×630 cada una). Misma espina de estilo, misma luz
luminosa, y dos personajes nuevos que no repitan los seis de arriba:

```
ronda-de-financiacion-con-tus-clientes  Two people at a sunlit table in a bright
                                        office, leaning over a printed document
                                        together, one mid-explanation. Plants and
                                        a big window behind.

spv-cap-table-limpio                    A woman at a bright desk sorting printed
                                        pages into two neat piles, seen from the
                                        side, morning light across the paper.
```

**Una foto tuya o del equipo** para la sección de contacto. Esta **no se genera**: pedir
una llamada de 30 minutos sobre dinero a alguien cuya cara no has visto es fricción pura,
y una cara inventada ahí sí sería engañosa. Una foto real vale, hecha con la misma luz
grande y clara que el resto.
