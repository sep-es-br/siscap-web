export function sortFunction(a: any, b: any, order: string): number {
  if (a < b) {
    return order === 'asc' ? -1 : 1;
  }

  if (a > b) {
    return order === 'asc' ? 1 : -1;
  }

  return 0;
}
