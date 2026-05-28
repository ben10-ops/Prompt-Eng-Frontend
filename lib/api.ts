const DEFAULT_BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://prompt-eng-backend.onrender.com";

const RAW_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL;

export const BACKEND_URL = RAW_BACKEND_URL.replace(/\/$/, "");

export function backendApi(path: string): string {
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SERVER_BACKEND_URL =
  (process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    DEFAULT_BACKEND_URL)
    .replace(/\/$/, "");
