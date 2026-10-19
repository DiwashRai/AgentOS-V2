import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    // "localhost" can resolve to ::1 only on Windows; bind IPv4 loopback explicitly. 5173 is V1's.
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
  },
  test: { environment: "node", include: ["src/**/*.test.{ts,tsx}"] },
});
