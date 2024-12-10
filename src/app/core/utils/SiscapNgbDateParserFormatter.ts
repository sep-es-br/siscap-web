import { Injectable } from '@angular/core';

import {
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';

@Injectable({ providedIn: 'root' })
export class SiscapNgbDateParserFormatter extends NgbDateParserFormatter {
  protected readonly FORMATO_DATA = 'dd/MM/yyyy';

  override parse(value: string): NgbDateStruct | null {
    const [day, month, year] = value.split('/');

    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      day: parseInt(day, 10),
    };
  }

  override format(date: NgbDateStruct | null): string {
    if (date === null) {
      return '';
    }

    const day = date.day.toString().padStart(2, '0');
    const month = date.month.toString().padStart(2, '0');
    const year = date.year;

    return `${day}/${month}/${year}`;
  }
}
