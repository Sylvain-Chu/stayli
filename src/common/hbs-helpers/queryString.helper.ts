export function queryString(context: any) {
  return Object.entries(context.hash)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(String(k))}=${encodeURIComponent(String(v))}`)
    .join('&');
}
