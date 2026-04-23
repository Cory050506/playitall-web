import { isElectronRuntime } from "@/lib/runtime";

export function getBrandAssetPath(filename: string) {
  return isElectronRuntime() ? `./brand/${filename}` : `/brand/${filename}`;
}
