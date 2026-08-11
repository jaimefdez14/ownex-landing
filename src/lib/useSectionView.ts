import { useEffect } from "react";
import { track } from "./analytics";

/**
 * Evento `section_view` (§11): una seccion visible al menos al 50 % durante 1 s.
 * Se dispara una sola vez por seccion y por visita.
 */
export function useSectionView() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const timers = new Map<string, number>();
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (!id || seen.has(id)) return;

          if (entry.isIntersecting) {
            timers.set(
              id,
              window.setTimeout(() => {
                seen.add(id);
                track("section_view", { section_id: id });
                observer.unobserve(entry.target);
              }, 1000),
            );
          } else {
            const timer = timers.get(id);
            if (timer) window.clearTimeout(timer);
            timers.delete(id);
          }
        });
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll<HTMLElement>("section[id]").forEach((el) => observer.observe(el));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
    };
  }, []);
}
