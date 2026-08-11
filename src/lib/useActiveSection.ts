import { useEffect, useState } from "react";

/**
 * Id de la seccion activa segun el scroll, para resaltar el enlace correspondiente
 * en la barra de navegacion.
 *
 * Un unico `IntersectionObserver`, con la franja de deteccion centrada en la parte
 * alta de la ventana (justo bajo la barra fija): la seccion que ocupa esa franja es
 * la que se marca como activa. Si `IntersectionObserver` no esta disponible, no se
 * marca ninguna, y el Navbar simplemente no resalta nada: no es contenido esencial.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
