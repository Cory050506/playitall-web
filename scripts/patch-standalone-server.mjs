import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const serverPath = path.join(process.cwd(), ".next", "standalone", "server.js");
const source = readFileSync(serverPath, "utf8");
const patched = source.replace("\nprocess.chdir(__dirname)\n", "\n");

if (source === patched) {
  console.warn("Standalone server did not contain the expected chdir call.");
} else {
  writeFileSync(serverPath, patched);
}
