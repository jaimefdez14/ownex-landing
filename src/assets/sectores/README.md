# Fotos por sector — "En la práctica"

Deja aquí el fichero y aparece solo. No hay que tocar código.

**Nombre del fichero = `id` del sector** en `src/components/ExamplesSection.tsx`:

```
moda.webp          restauracion.webp   wellness.webp
bebidas.webp       belleza.webp        clubes.webp
```

("otros" no lleva foto a propósito: es la ficha que dice que la lógica no depende
del sector, y ponerle una imagen de algo la volvería a atar a un sector.)

Formatos admitidos: `.webp`, `.avif`, `.jpg`, `.png`. Preferible `.webp`.

**Proporción 3:2** y 720px de ancho basta: el hueco mide 300px en escritorio y se
sirve a 2x. En móvil el mismo fichero se recorta a una franja 5:2 que solo enseña
del 31 % al 69 % de la altura, así que si el sujeto no está centrado en vertical,
ajusta `focus` en el sector correspondiente (sintaxis de `object-position`).

El texto alternativo vive en `ExamplesSection.tsx`, en `image.alt`: describe la
FOTO, no el sector.

Por qué aquí y no en `public/`: Vite resuelve estos ficheros en tiempo de
compilación (`import.meta.glob`), así que una foto que no existe simplemente no
genera etiqueta. En `public/` la ruta se escribe a mano y el navegador se come un
404 por cada foto que aún no está.
