import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: [
      "**/*.{test,spec}.?(c|m)[jt]s?(x)",
      "**/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)",
      "**/*Test.?(c|m)[jt]s?(x)",
      "**/__tests__/**/*Test.?(c|m)[jt]s?(x)",
    ],
  },
});
