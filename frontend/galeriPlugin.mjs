import fs from "node:fs";

function formatGaleriTitle(filename) {
  const base = filename.replace(/\.[^.]+$/, "");
  return base
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function galeriPhotosPlugin() {
  const virtualId = "virtual:galeri-photos";
  const resolvedId = `\0${virtualId}`;
  const galeriDir = new URL("./public/galeri", import.meta.url).pathname;

  return {
    name: "galeri-photos",
    resolveId(id) {
      if (id === virtualId) return resolvedId;
    },
    configureServer(server) {
      server.watcher.add(galeriDir);
      const reload = (filePath) => {
        if (!filePath.startsWith(galeriDir)) return;
        const mod = server.moduleGraph.getModuleById(resolvedId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload);
      server.watcher.on("unlink", reload);
      server.watcher.on("change", reload);
    },
    load(id) {
      if (id !== resolvedId) return;
      let files = [];
      try {
        files = fs
          .readdirSync(galeriDir)
          .filter((name) => /\.(jpe?g|png|webp|gif|avif)$/i.test(name))
          .sort((a, b) => a.localeCompare(b, "id"));
      } catch {
        files = [];
      }
      const items = files.map((file, idx) => ({
        id: idx + 1,
        category: "Galeri",
        title: formatGaleriTitle(file),
        src: `/galeri/${file}`,
      }));
      return `export default ${JSON.stringify(items)};`;
    },
  };
}
