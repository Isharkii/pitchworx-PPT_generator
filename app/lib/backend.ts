// Returns BACKEND_URL with https:// guaranteed, or null if not set
export function getBackendUrl(): string | null {
  const url = process.env.BACKEND_URL?.trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}
