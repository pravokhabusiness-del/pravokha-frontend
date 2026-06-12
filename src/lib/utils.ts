import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMediaUrl(path: string | null | undefined) {
  if (!path || path === "" || path === "/") return "";
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
  if (path.startsWith("/src") || path.startsWith("/assets") || path.includes("assets/")) return path;

  // Get base URL from API_URL (strip /api)
  const apiUrl = import.meta.env.VITE_API_URL || 'https://pravokha-api-ard4h8dhbgdmc4ec.southindia-01.azurewebsites.net/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
