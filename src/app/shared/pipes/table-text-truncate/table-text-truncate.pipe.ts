import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'texttrunc',
  standalone: true,
})
export class TableTextTruncatePipe implements PipeTransform {
  transform(value: Array<any>, limit: number): string {
    const displayedText = value
      .filter((item, index) => index < limit)
      .join(', ');

    const spareValuesText =
      limit < value.length ? `, e mais ${value.length - limit}` : '';

    return displayedText + spareValuesText;
  }
}
