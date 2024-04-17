export function ArrayItemNumberToStringMapper(
  array: Array<number>
): Array<string> {
  return array.map((item) => item.toString());
}
