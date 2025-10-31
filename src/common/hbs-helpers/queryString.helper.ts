export function queryString(context: { hash: Record<string, unknown> }) {
  const entries = Object.entries(context.hash);
  return entries
    .filter(([, v]) => v !== undefined && v !== null && !(typeof v === 'string' && v === ''))
    .map(([k, v]) => {
      let valueStr: string;
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        valueStr = String(v);
      } else if (v instanceof Date) {
        valueStr = v.toISOString();
      } else {
        // For objects/arrays/fallbacks: JSON stringify safely
        try {
          valueStr = JSON.stringify(v);
        } catch {
          valueStr = String(v as any);
        }
      }
      return `${encodeURIComponent(k)}=${encodeURIComponent(valueStr)}`;
    })
    .join('&');
}
