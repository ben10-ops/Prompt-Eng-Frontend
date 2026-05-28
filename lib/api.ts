const RAW_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://prompt-eng-backend.onrender.com";

export const BACKEND_URL = RAW_BACKEND_URL.replace(/\/$/, "");

export function backendApi(path: string): string {
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SERVER_BACKEND_URL =
  (process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://prompt-eng-backend.onrender.com")
    .replace(/\/$/, "");
