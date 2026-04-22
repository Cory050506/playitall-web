import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const serverPath = path.join(process.cwd(), ".next", "standalone", "server.js");
const source = readFileSync(serverPath, "utf8");
const patched = source.replace("\nprocess.chdir(__dirname)\n", "\n");

if (source === patched) {
  console.warn("Standalone server did not contain the expected chdir call.");
} else {
  writeFileSync(serverPath, patched);
}

const standaloneNextDir = path.join(process.cwd(), ".next", "standalone", ".next");
const standaloneStaticDir = path.join(standaloneNextDir, "static");
const standalonePublicDir = path.join(process.cwd(), ".next", "standalone", "public");

mkdirSync(standaloneNextDir, { recursive: true });
rmSync(standaloneStaticDir, { recursive: true, force: true });
rmSync(standalonePublicDir, { recursive: true, force: true });
cpSync(path.join(process.cwd(), ".next", "static"), standaloneStaticDir, {
  recursive: true,
});
cpSync(path.join(process.cwd(), "public"), standalonePublicDir, {
  recursive: true,
});
