import { Injectable } from '@angular/core';

import {
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';

@Injectable({ providedIn: 'root' })
export class SiscapNgbDateParserFormatter extends NgbDateParserFormatter {
  private readonly DELIMITER = '/';

  override parse(value: string): NgbDateStruct | null {
    if (value) {
      const [day, month, year] = value.split(this.DELIMITER);

      return {
        year: parseInt(year, 10),
        month: parseInt(month, 10),
        day: parseInt(day, 10),
      };
    }
    return null;
  }

  override format(date: NgbDateStruct | null): string {
    return date
      ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year
      : '';
  }
}
