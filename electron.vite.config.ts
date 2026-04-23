import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "dist-electron/main",
      rollupOptions: {
        input: resolve(__dirname, "desktop/electron/main.ts"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "dist-electron/preload",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "desktop/electron/preload.ts"),
        },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "desktop/renderer"),
    publicDir: resolve(__dirname, "public"),
    resolve: {
      alias: {
        "@": resolve(__dirname),
        "next/link": resolve(__dirname, "desktop/renderer/src/next-shims/link.tsx"),
        "next/image": resolve(__dirname, "desktop/renderer/src/next-shims/image.tsx"),
        "next/navigation": resolve(
          __dirname,
          "desktop/renderer/src/next-shims/navigation.ts"
        ),
      },
    },
    plugins: [react()],
    build: {
      outDir: resolve(__dirname, "dist-electron/renderer"),
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, "desktop/renderer/index.html"),
      },
    },
  },
});
