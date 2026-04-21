import md5 from "blueimp-md5";

export function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export function makeSalt(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";

  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }

  return out;
}

export function md5Hex(input: string) {
  return md5(input);
}