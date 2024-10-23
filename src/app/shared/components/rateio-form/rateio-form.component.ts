import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';

import { fromEvent, merge } from 'rxjs';
import {
  NgbAccordionItem,
  NgbAccordionModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskPipe } from 'ngx-mask';

import { RateioMicrorregiaoFormCardComponent } from './rateio-microrregiao-form-card/rateio-microrregiao-form-card.component';
import { RateioMunicipioFormCardComponent } from './rateio-municipio-form-card/rateio-municipio-form-card.component';

import { RateioService } from '../../../core/services/rateio/rateio.service';

import { ILocalidadeSelectList } from '../../../core/interfaces/select-list.interface';

import { SIDEWAYS_SHAKE } from '../../../core/utils/animations';

@Component({
  selector: 'siscap-rateio-form',
  standalone: true,
  imports: [
    CommonModule,
    NgxMaskPipe,
    NgbAccordionModule,
    RateioMicrorregiaoFormCardComponent,
    RateioMunicipioFormCardComponent,
  ],
  templateUrl: './rateio-form.component.html',
  styleUrl: './rateio-form.component.scss',
})
export class RateioFormComponent implements AfterViewInit {
  @ViewChild('rateioMicrorregiaoAccordionItem')
  public rateioMicrorregiaoAccordionItem!: NgbAccordionItem;

  // @Input() public microrregioesSelectList: Array<ISelectList> = [];
  // @Input() public cidadesComMicrorregiaoSelectList: Array<ICidadeSelectList> =
  //   [];
  // @Input() public localidadesSelectList: Array<ILocalidadeSelectList> = [];
  @Input() public isModoEdicao: boolean = false;

  /*
    !!!!! REFATORAÇÃO COMPLETA DESSA BAGAÇA !!!!!

    - LISTAGEM AGORA É POR LOCALIDADE (ILocalidadeSelectList)
    |-> FILTRAR POR TIPO ("Microrregiao" OU "Municipio" -> CRIAR ENUM?)
    |-> FILTRAR CIDADES POR idLocalidadePai && tipo == "Municipio"

    - SÓ PERSISTIR QUANTIA NO BANCO
    |-> CALCULAR PORCENTAGEM DINAMICAMENTE AO INPUT DO USUARIO
        |-> MEIO QUE MANTÉM A LÓGICA DE AGORA (USANDO fromEvent)
    
    * FOCAR EM MELHORAR O CONTROLE DOS CHECKBOXES
    ~ JUSTAMENTE PQ O VINCULO AGORA É PROJETO COM LOCALIDADE, NÃO PRECISA
      OBRIGAR USUARIO A SELECIONAR CIDADE DEPOIS DA MICRO E VICE-VERSA
    |-> AO MARCAR MICRORREGIAO, SELECIONA TODAS AS CIDADES
    |-> AO DESMARCAR MICRORREGIAO, DESSELECIONA TODAS AS CIDADES
    |-> SE CIDADE FOR SELECIONADA SEM A MICRORREGIAO, MARCAR MICROREGIAO

    * REMOVER BOTÕES DE CALCULO AUTOMÁTICO
    |-> APENAS CASCATEAR ALTERAÇÕES DE BAIXO PRA CIMA
        |-> MUDOU CIDADE, ALTERA MICRORREGIAO PAI 
        |-> MAS NÃO O CONTRÁRIO (ACHO QUE VAI FERRAR COM O USUÁRIO SE FIZER ISSO) 
  */

  constructor(public rateioService: RateioService) {
    this.rateioService.localidadeCheckboxChange$.subscribe(
      (localidadeCheckboxChange) => {
        console.log(localidadeCheckboxChange);

        this.rateioService.verificarControleLocalidadesCheckbox(
          localidadeCheckboxChange
        );
      }
    );
  }

  ngAfterViewInit(): void {
    // const calculoAutomaticoMicrorregiaoButton = document.querySelector(
    //   'button#calculo-automatico-microrregiao'
    // );
    // const calculoAutomaticoCidadeButton = document.querySelector(
    //   'button#calculo-automatico-cidade'
    // );
    // if (calculoAutomaticoMicrorregiaoButton && calculoAutomaticoCidadeButton) {
    //   merge(
    //     fromEvent(calculoAutomaticoMicrorregiaoButton, 'click'),
    //     fromEvent(calculoAutomaticoCidadeButton, 'click')
    //   ).subscribe((clickEvent) => {
    //     if (!this.rateioService.quantiaFormControlReferencia) {
    //       clickEvent.preventDefault();
    //       document
    //         .querySelector('div#nullQuantiaFormControlValueCol')
    //         ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
    //     }
    //   });
    // }
  }

  // public filtrarCidadesPorMicrorregiao(
  //   idMicrorregiao: number
  // ): Array<ICidadeSelectList> {
  //   return this.cidadesComMicrorregiaoSelectList.filter(
  //     (cidade) => cidade.idMicrorregiao === idMicrorregiao
  //   );
  // }
}
