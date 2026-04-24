export function isElectronRuntime() {
  return (
    typeof window !== "undefined" && Boolean(window.playItAllElectron?.isElectron)
  );
}

export function isLocalhostHost(hostname: string) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

export function canUseGoogleCastWebSdk() {
  if (typeof window === "undefined") return false;
  if (isElectronRuntime()) return false;

  const { protocol, hostname } = window.location;
  return protocol === "https:" || isLocalhostHost(hostname);
}

export function getPlatform() {
  if (typeof navigator === "undefined") return "unknown";

  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes("mac os") || agent.includes("macintosh")) return "mac";
  if (agent.includes("windows")) return "windows";
  if (agent.includes("linux")) return "linux";
  return "unknown";
}
