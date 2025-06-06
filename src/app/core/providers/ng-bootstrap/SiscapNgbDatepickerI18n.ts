import { Injectable } from '@angular/core';
import { TranslationWidth } from '@angular/common';

import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable({ providedIn: 'root' })
export class SiscapNgbDatepickerI18n extends NgbDatepickerI18n {
  private readonly DIASSEMANA_CURTO: Array<string> = [
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sab',
    'Dom',
  ];

  private readonly MESES_CURTO: Array<string> = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  private readonly MESES_LONGO: Array<string> = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  override getWeekdayLabel(weekday: number, width?: TranslationWidth): string {
    return this.DIASSEMANA_CURTO[weekday - 1];
  }
  override getMonthShortName(month: number, year?: number): string {
    return this.MESES_CURTO[month - 1];
  }
  override getMonthFullName(month: number, year?: number): string {
    return this.MESES_LONGO[month - 1];
  }
  override getDayAriaLabel(date: NgbDateStruct): string {
    return '';
  }
}
