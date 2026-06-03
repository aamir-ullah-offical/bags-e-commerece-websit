import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup basic parsers
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Static files or logs fallback
  app.use((req, res, next) => {
    // Log minimal for info
    console.log(`[API ROOT] ${req.method} ${req.path}`);
    next();
  });

  // Mount Unified MERN Express APIs under /api/v1
  const { apiRouter } = await import("./src/server/api");
  app.use("/api/v1", apiRouter);

  // Serve static assets or mount Vite Developer Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER BIND] MERN Stack running on http://localhost:${PORT}`);
  });
}

startServer();
