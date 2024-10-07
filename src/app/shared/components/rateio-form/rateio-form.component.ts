import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';

import { fromEvent, merge } from 'rxjs';
import {
  NgbAccordionItem,
  NgbAccordionModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskPipe } from 'ngx-mask';

import { RateioMicrorregiaoFormCardComponent } from './rateio-microrregiao-form-card/rateio-microrregiao-form-card.component';
import { RateioCidadeFormCardComponent } from './rateio-cidade-form-card/rateio-cidade-form-card.component';

import { RateioService } from '../../../core/services/rateio/rateio.service';

import {
  ICidadeSelectList,
  ISelectList,
} from '../../../core/interfaces/select-list.interface';

import { SIDEWAYS_SHAKE } from '../../../core/utils/animations';

@Component({
  selector: 'siscap-rateio-form',
  standalone: true,
  imports: [
    CommonModule,
    NgxMaskPipe,
    NgbAccordionModule,
    RateioMicrorregiaoFormCardComponent,
    RateioCidadeFormCardComponent,
  ],
  templateUrl: './rateio-form.component.html',
  styleUrl: './rateio-form.component.scss',
})
export class RateioFormComponent implements AfterViewInit {
  @ViewChild('rateioMicrorregiaoAccordionItem')
  public rateioMicrorregiaoAccordionItem!: NgbAccordionItem;

  @Input() public microrregioesSelectList: Array<ISelectList> = [];
  @Input() public cidadesComMicrorregiaoSelectList: Array<ICidadeSelectList> =
    [];
  @Input() public isModoEdicao: boolean = false;

  constructor(public rateioService: RateioService) {}

  ngAfterViewInit(): void {
    const calculoAutomaticoMicrorregiaoButton = document.querySelector(
      'button#calculo-automatico-microrregiao'
    );

    const calculoAutomaticoCidadeButton = document.querySelector(
      'button#calculo-automatico-cidade'
    );

    if (calculoAutomaticoMicrorregiaoButton && calculoAutomaticoCidadeButton) {
      merge(
        fromEvent(calculoAutomaticoMicrorregiaoButton, 'click'),
        fromEvent(calculoAutomaticoCidadeButton, 'click')
      ).subscribe((clickEvent) => {
        if (!this.rateioService.quantiaFormControlReferencia) {
          clickEvent.preventDefault();
          document
            .querySelector('div#nullQuantiaFormControlValueCol')
            ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
        }
      });
    }
  }

  public filtrarCidadesPorMicrorregiao(
    idMicrorregiao: number
  ): Array<ICidadeSelectList> {
    return this.cidadesComMicrorregiaoSelectList.filter(
      (cidade) => cidade.idMicrorregiao === idMicrorregiao
    );
  }
}
