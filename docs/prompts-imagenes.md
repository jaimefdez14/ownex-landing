# Prompts de imagen — fotos de sector y assets pendientes

Rescatado de la sesión del 27/08/2026 ("Landing page visual y contenido"), donde se
escribieron pero no se guardaron. Las instrucciones de **formato, recorte y enchufe**
viven en `src/assets/sectores/README.md` — esto es solo el texto de los prompts.

Vive aquí y no junto a las fotos porque `check:copy` recorre `src/` en busca de
vocabulario prohibido, y los negativos de estos prompts lo contienen a propósito.

Regla que manda sobre todas las demás: **el mismo fichero se recorta a una columna
estrecha en escritorio y a una franja fina en móvil**, así que el sujeto va centrado y
sin nada importante en los bordes. Proporción **3:2**.

---

## 1 · Espina de estilo

Va delante de cada uno de los prompts de sector. Es lo que hace que los siete parezcan
un set y no siete imágenes sueltas — no cambiarla entre prompts.

```
Editorial still-life photograph, single subject centered in frame with generous
empty margins on all sides. Soft directional daylight from the left, gentle
shadows, shallow depth of field. Warm off-white backdrop with a faint cool-green
cast. Muted desaturated palette, natural materials, one restrained deep-emerald
accent (#047857) somewhere in the frame. Medium-format look, 50mm, subtle film
grain. Calm, institutional, understated — the visual language of Stripe or Aesop,
not stock photography. No text, no logos, no brand names, no faces.
Aspect ratio 3:2, 1500x1000.
```

Negativo, común a los siete:

```
no text, no watermark, no logos, no faces, no crypto imagery, no blockchain
motifs, no glowing neon, no 3D coins, no charts or graphs, no hands holding
phones, no cluttered composition, no vignette, no HDR, no oversaturation
```

---

## 2 · Los seis sectores con foto

Espina de estilo + una de estas líneas de sujeto. El nombre del fichero es el `id` del
sector en `src/components/ExamplesSection.tsx`.

```
moda.webp          A single folded knit garment on a pale linen surface, one brass
                   clothing tag catching the light.

restauracion.webp  A single ceramic plate with a folded linen napkin and one glass
                   of water on a worn wooden table.

wellness.webp      A rolled cotton towel and a single dumbbell on a pale concrete
                   surface, morning light.

bebidas.webp       One unlabelled dark glass bottle beside a small tasting glass on
                   a stone counter.

belleza.webp       A single unlabelled amber glass dropper bottle on a pale marble
                   surface with a soft shadow.

clubes.webp        A folded plain jersey and a worn leather ball on a wooden bench,
                   low side light.
```

**`otros` no lleva foto.** El prompt original incluía una séptima línea (cuaderno
abierto y pluma), pero se descartó después: esa ficha dice justamente que la lógica no
depende del sector, y ponerle una imagen de algo la vuelve a atar a un sector.

**Si prefieres gente en vez de bodegón:** cambia solo la línea de sujeto y quita
`no faces` del negativo, pero usa **manos y figuras parciales, nunca caras completas** —
con estos recortes una cara se corta por la mitad.

### Textos alternativos

El `alt` describe la FOTO, no el sector, y vive en `ExamplesSection.tsx` (`image.alt`).
Tres sectores ya lo tienen escrito, y **el prompt debe respetarlos** (llevan el acento
esmeralda en el sujeto):

| Sector | Estado del `alt` |
|---|---|
| `moda` | escrito — jersey **verde oscuro**, etiqueta dorada |
| `restauracion` | escrito — servilleta **verde**; además `focus: "center 72%"` |
| `wellness` | escrito — mancuerna **verde oscuro** |
| `bebidas`, `belleza`, `clubes` | pendiente: añadir el bloque `image: { alt: … }` al generar la foto |

---

## 3 · Avatares de las bolitas

Miden **20×20 px**. Una cara fotográfica ahí es una mancha, y en el panel de accionistas
esas bolitas van junto a nombres inventados (Marta Solé, Laia Ferrer): caras generadas +
nombres propios se lee como clientela ficticia, que es distinto de un mockup de producto.
Hay un comentario en el código que dice explícitamente que se usaron iniciales "sin
inventar fotos de personas que no existen".

Recomendación — **avatares ilustrados, no fotos**:

```
Flat vector avatar portrait, extreme simplification, single human silhouette from
the shoulders up, no facial features at all, solid two-tone fill: muted sage green
figure on a warm cream circle. Centered, generous margin, readable at 20 pixels.
Minimal geometric style. No text, no outline, no gradient, no shadow.
Output 96x96 PNG, transparent background outside the circle.
```

Genera 6-8 variando el fondo entre `#A5EBC7`, `#E3F0E8`, `#F0F1EE` y la silueta entre
`#04543E` y `#5C6A61`.

Si aun así quieres fotos reales, el prompt sería este — pero entonces cambia también los
nombres del mockup por iniciales:

```
Candid portrait headshot, natural window light, neutral warm background, relaxed
expression, shoulders visible, shot on 85mm, subtle film grain, documentary tone.
Diverse ages and appearances. Square crop, subject centered. 512x512.
```

---

## 4 · Assets que faltan (no son fotos de sector)

**`public/og-image.png` (1200×630) — la más urgente.** La que hay es de la versión
oscura y no lleva el logo nuevo; es lo que se ve al compartir ownex.co en WhatsApp o
LinkedIn (referenciada en `index.html`, `og:image`). **No generar con IA**: es tipografía
+ logo, sale más nítida construida en HTML y exportada a PNG.

**Portadas de los dos artículos** (1200×630 cada una), para que se compartan bien. Misma
espina de estilo, cambiando el sujeto:

```
ronda-de-financiacion-con-tus-clientes  A stack of plain paper documents with a
                                        single emerald bookmark ribbon, on a pale
                                        desk.

spv-cap-table-limpio                    Three stacked wooden blocks of decreasing
                                        size on a pale surface, the top one deep
                                        emerald.
```

**Una foto tuya o del equipo** para la sección de contacto. Esta **no se genera**: pedir
una llamada de 30 minutos sobre dinero a alguien cuya cara no has visto es fricción pura,
y una cara inventada ahí sí sería engañosa. Una foto real con luz de ventana vale.
