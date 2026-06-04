export function extractUserIdFromToken(accessToken: string): string | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      decodeBase64Url(parts[1]),
    ) as { id?: string; userId?: string; sub?: string };
    return payload.id ?? payload.userId ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  if (typeof atob === 'function') {
    return decodeURIComponent(
      Array.from(atob(padded))
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
  }
  return Buffer.from(padded, 'base64').toString('utf-8');
}
