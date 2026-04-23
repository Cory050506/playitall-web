export function isElectronRuntime() {
  return (
    typeof window !== "undefined" && Boolean(window.playItAllElectron?.isElectron)
  );
}

export function getPlatform() {
  if (typeof navigator === "undefined") return "unknown";

  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes("mac os") || agent.includes("macintosh")) return "mac";
  if (agent.includes("windows")) return "windows";
  if (agent.includes("linux")) return "linux";
  return "unknown";
}
