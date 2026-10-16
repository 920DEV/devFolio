import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleApiRequest } from "./api.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staticRoot = path.join(projectRoot, "dist");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".webm": "video/webm",
};

const server = createServer(async (request, response) => {
  try {
    if (await handleApiRequest(request, response)) return;
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    let filePath = path.resolve(staticRoot, `.${pathname}`);
    if (filePath !== staticRoot && !filePath.startsWith(`${staticRoot}${path.sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    try {
      if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, "index.html");
    } catch {
      filePath = path.join(staticRoot, "index.html");
    }
    const content = await readFile(filePath);
    response.writeHead(200, { "content-type": contentTypes[path.extname(filePath)] ?? "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(500).end("Server error");
  }
});

const port = Number(process.env.PORT ?? 4179);
server.listen(port, process.env.HOST ?? "0.0.0.0", () => {
  console.log(`Portfolio server listening on port ${port}`);
});