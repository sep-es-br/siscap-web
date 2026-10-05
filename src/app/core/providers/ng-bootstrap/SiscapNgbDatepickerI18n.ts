import { MENSAGENS } from '../../utils/constants';
import { Injectable } from '@angular/core';
import { TranslationWidth } from '@angular/common';

import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable({ providedIn: 'root' })
export class SiscapNgbDatepickerI18n extends NgbDatepickerI18n {
  private readonly DIASSEMANA_CURTO: Array<string> = [
    MENSAGENS.SEG,
    MENSAGENS.TER,
    MENSAGENS.QUA,
    MENSAGENS.QUI,
    MENSAGENS.SEX,
    MENSAGENS.SAB,
    MENSAGENS.DOM,
  ];

  private readonly MESES_CURTO: Array<string> = [
    MENSAGENS.JAN,
    MENSAGENS.FEV,
    MENSAGENS.MAR,
    MENSAGENS.ABR,
    MENSAGENS.MAI,
    MENSAGENS.JUN,
    MENSAGENS.JUL,
    MENSAGENS.AGO,
    MENSAGENS.SET,
    MENSAGENS.OUT,
    MENSAGENS.NOV,
    MENSAGENS.DEZ,
  ];

  private readonly MESES_LONGO: Array<string> = [
    MENSAGENS.JANEIRO,
    MENSAGENS.FEVEREIRO,
    MENSAGENS.MARCO,
    MENSAGENS.ABRIL,
    MENSAGENS.MAIO,
    MENSAGENS.JUNHO,
    MENSAGENS.JULHO,
    MENSAGENS.AGOSTO,
    MENSAGENS.SETEMBRO,
    MENSAGENS.OUTUBRO,
    MENSAGENS.NOVEMBRO,
    MENSAGENS.DEZEMBRO,
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
