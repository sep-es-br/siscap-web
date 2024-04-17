export function ArrayItemNumberToStringMapper(
  array: Array<number> | undefined
): Array<string> {
  if (!array) {
    return [];
  }

  return array.map((item) => item.toString());
}
