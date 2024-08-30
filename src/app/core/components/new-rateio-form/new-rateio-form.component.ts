import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input } from '@angular/core';

import { fromEvent, merge } from 'rxjs';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { RateioMicrorregiaoFormCardComponent } from './rateio-microrregiao-form-card/rateio-microrregiao-form-card.component';
import { RateioCidadeFormCardComponent } from './rateio-cidade-form-card/rateio-cidade-form-card.component';

import { RateioService } from '../../../shared/services/rateio/rateio.service';

import {
  ICidadeSelectList,
  ISelectList,
} from '../../../shared/interfaces/select-list.interface';

import { SIDEWAYS_SHAKE } from '../../../shared/utils/animations';

@Component({
  selector: 'new-rateio-form',
  standalone: true,
  imports: [
    CommonModule,
    NgbAccordionModule,
    RateioMicrorregiaoFormCardComponent,
    RateioCidadeFormCardComponent,
  ],
  templateUrl: './new-rateio-form.component.html',
  styleUrl: './new-rateio-form.component.scss',
})
export class NewRateioFormComponent implements AfterViewInit {
  @Input() public microrregioesList: Array<ISelectList> = [];
  @Input() public cidadesComMicrorregiaoList: Array<ICidadeSelectList> = [];
  @Input() public formMode: string = '';
  @Input() public isEdit: boolean = false;

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
        if (!this.rateioService.valorEstimadoReferencia) {
          clickEvent.preventDefault();
          document
            .querySelector('div#nullValorEstimadoCol')
            ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
        }
      });
    }
  }

  public filtrarCidadesPorMicrorregiao(
    idMicrorregiao: number
  ): Array<ICidadeSelectList> {
    return this.cidadesComMicrorregiaoList.filter(
      (cidade) => cidade.idMicrorregiao === idMicrorregiao
    );
  }
}
