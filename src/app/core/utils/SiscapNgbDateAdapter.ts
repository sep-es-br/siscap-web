import { Injectable } from '@angular/core';

import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable({ providedIn: 'root' })
export class SiscapNgbDateAdapter extends NgbDateAdapter<string> {
  
  override fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);

      return {
        year: parseInt(year, 10),
        month: parseInt(month, 10),
        day: parseInt(day, 10),
      };
    }
    return null;
  }

  override toModel(date: NgbDateStruct | null): string | null {
    if (date) {
      const year = date.year.toString().padStart(4, '0');
      const month = date.month.toString().padStart(2, '0');
      const day = date.day.toString().padStart(2, '0');

      return year + month + day;
    }
    return null;
  }
}
