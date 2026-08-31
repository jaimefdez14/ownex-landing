# Fotos por sector — "En la práctica"

> **EL HUECO DE FOTO YA NO EXISTE — 31/08/2026.** Esta carpeta está vacía a
> propósito y de momento no la lee nadie. Lo de abajo es cómo volver, no cómo está.

Este README describía un mecanismo que se retiró el mismo día en dos pasos, los dos
por decisión de Jaime: primero salieron las tres fotos que había (`moda`,
`restauracion`, `wellness`) —"las añadiré cuando las tenga"— y después el hueco
entero, con su motivo de marca de reserva —"sin placeholders tampoco"—.

Con el hueco se fueron todas sus piezas, así que **dejar un fichero aquí ya no hace
nada**. Lo que había que reponer para que volviera a funcionar:

| Pieza | Dónde vivía |
|---|---|
| `sectorPhotos` (`import.meta.glob` de esta carpeta) y `photoFor(id)` | `src/components/ExamplesSection.tsx` |
| Campo `image: { alt, focus }` del tipo `Sector`, y el de cada sector | `src/components/ExamplesSection.tsx` |
| La columna de 300px del panel, con la foto a sangre y el motivo debajo | `src/components/ExamplesSection.tsx` |
| `.sector-art` y sus cuatro reglas satélite (proporciones por punto de ruptura, rejilla del `::after`, glifo, foto superpuesta) | `src/index.css` |

**Para recuperarlo entero:**

```
git show 6f20325^ -- src/components/ExamplesSection.tsx src/index.css
git show a0c12c6^ -- src/assets/sectores
```

El primero trae el código con hueco y motivo; el segundo, las tres fotos.

Los prompts con los que se generaron esas fotos siguen en
`docs/prompts-imagenes.md`, con su propio aviso de que están en pausa. Ojo: están
escritos para **seis** sectores, y desde el 31/08 solo quedan cuatro (fuera bebidas,
belleza y clubes).
