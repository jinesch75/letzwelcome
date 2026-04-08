import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async url() {
      const url = process.env.DATABASE_URL;
      if (!url) {
        throw new Error("DATABASE_URL is not set");
      }
      return url;
    },
  },
});
