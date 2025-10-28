export function paginationPages(current: number, total: number) {
  current = Number(current);
  total = Number(total);
  const delta = 2;
  const pages: number[] = [];
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.push(i);
  }
  return pages;
}
