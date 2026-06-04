const COMPOSITION_MARKERS = [
  'состав:',
  'состав ',
  'ингредиенты:',
  'ингредиенты ',
  'ingredients:',
  'ingredients ',
];

export function parseIngredients(rawText: string): string[] {
  const normalized = rawText.replace(/\n/g, ' ').trim();
  if (!normalized) return [];

  const lower = normalized.toLowerCase();
  let block = normalized;
  for (const marker of COMPOSITION_MARKERS) {
    const idx = lower.indexOf(marker);
    if (idx >= 0) {
      block = normalized.slice(idx + marker.length);
      break;
    }
  }

  return block
    .split(/[,;.|]/)
    .map((s) => s.trim().replace(/^["'(\[]+|["')\]]+$/g, ''))
    .filter((s) => s.length >= 2)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 40);
}

export function guessProductName(rawText: string): string | null {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const candidate = lines.find(
    (line) => line.length >= 3 && line.length <= 60 && !line.toLowerCase().startsWith('состав'),
  );
  return candidate ?? null;
}
