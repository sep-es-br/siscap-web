export function FormControlValueStringConverter(
  value: number | Array<number>
): string | Array<string> {
  if (typeof value === 'number') {
    return String(value);
  }

  return value.map((item) => String(item));
}
