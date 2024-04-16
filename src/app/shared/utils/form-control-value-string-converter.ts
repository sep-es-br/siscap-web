export function FormControlValueStringConverter(
  value: number | Array<number>
): string | Array<string> {
  if (typeof value === 'number') {
    return value.toString();
  }

  return value.map((item) => item.toString());
}
