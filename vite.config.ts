import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// ✅ Vite configuration with React SWC plugin and path alias
export default defineConfig({
  server: {
    host: "localhost", // يمكنك تغييره لـ "::" إذا كنت تريد دعم IPv6
    port: 8080,
  },
  plugins: [
    react(),
    // componentTagger() محذوف لأنه غير متوفر
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // اختصار @ يشير إلى مجلد src
    },
  },
});
