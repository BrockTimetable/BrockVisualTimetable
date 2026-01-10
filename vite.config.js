import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: [
      "**/*.{test,spec}.?(c|m)[jt]s?(x)",
      "**/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)",
      "**/*Test.?(c|m)[jt]s?(x)",
      "**/__tests__/**/*Test.?(c|m)[jt]s?(x)",
    ],
  },
});
