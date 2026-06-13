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

export function getProductFallbackImage(title: string, category?: string) {
  const name = (title || "").toLowerCase();
  const cat = (category || "").toLowerCase();

  if (name.includes("beauty") || cat.includes("beauty")) {
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80";
  }
  if (name.includes("book") || cat.includes("book") || cat.includes("books")) {
    return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80";
  }
  if (name.includes("electr") || cat.includes("electr") || cat.includes("gadget")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
  }
  if (name.includes("kitchen") || name.includes("home") || cat.includes("kitchen") || cat.includes("home")) {
    return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80";
}
