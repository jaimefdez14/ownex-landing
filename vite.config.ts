import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5188,
  },
  // `vite preview` reads its port from this key, not from `server`. Sin esto, quitar
  // el `--port` fijo del script `preview` de package.json haría que cayera en el
  // 4173 por defecto de Vite en lugar de respetar el puerto que asigne el harness.
  preview: {
    port: Number(process.env.PORT) || 4173,
  },
  build: {
    assetsInlineLimit: 0,
  },
});
