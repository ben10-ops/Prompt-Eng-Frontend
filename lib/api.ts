export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export function backendApi(path: string): string {
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SERVER_BACKEND_URL =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
