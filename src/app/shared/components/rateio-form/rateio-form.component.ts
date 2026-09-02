import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';

import { fromEvent, startWith } from 'rxjs';
import {
  NgbAccordionDirective,
  NgbAccordionModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskPipe } from 'ngx-mask';

import { RateioMicrorregiaoFormCardComponent } from './rateio-microrregiao-form-card/rateio-microrregiao-form-card.component';
import { RateioMunicipioFormCardComponent } from './rateio-municipio-form-card/rateio-municipio-form-card.component';

import { RateioService } from '../../../core/services/rateio/rateio.service';

import { SIDEWAYS_SHAKE } from '../../../core/utils/animations';
import { AcaoFormType } from '../../../core/types/form/acao-form.type';
import { ILocalidadeOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';

@Component({
  selector: 'siscap-rateio-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxMaskPipe,
    NgbAccordionModule,
    RateioMicrorregiaoFormCardComponent,
    RateioMunicipioFormCardComponent,
  ],
  providers: [RateioService],
  templateUrl: './rateio-form.component.html',
  styleUrl: './rateio-form.component.scss',
})
export class RateioFormComponent implements OnInit, AfterViewInit {

  @ViewChild(NgbAccordionDirective)
  public rateioNgbAccordion!: NgbAccordionDirective;

  @Input()
  public isModoEdicao: boolean = false;

  @Input({ required: true })
  public formAcao!: FormGroup<AcaoFormType>;

  @Input({ required: true })
  public localidadesOpcoes!: Array<ILocalidadeOpcoesDropdown>;

  public todoEstadoCheckbox: boolean = false;

  public distribuicaoLinearCheckbox: boolean = false;

  private static contadorInstancias = 0;

  public readonly instanciaId =
    ++RateioFormComponent.contadorInstancias;

  constructor(
    public rateioService: RateioService
  ) { }

  ngOnInit(): void {

    this.rateioService.localidadesOpcoes =
      this.localidadesOpcoes;

    this.rateioService.vincularRateioFormArray(
      this.formAcao.controls.rateio
    );

    console.log(
      '1 - SERVICE E AÇÃO USAM MESMO RATEIO?',
      this.rateioService.rateioFormArray ===
      this.formAcao.controls.rateio
    );

    console.log(
      '2 - PAI DA AÇÃO:',
      this.formAcao.parent
    );

    console.log(
      '3 - ROOT DA AÇÃO:',
      this.formAcao.root.getRawValue()
    );

    this.inicializarValorAcao();
    this.inicializarTodoEstado();
    
  }

  ngAfterViewInit(): void {

    const estadoCheckboxDiv =
      document.querySelector('div#estado-checkbox-div');

    if (!estadoCheckboxDiv) {
      return;
    }

    fromEvent(estadoCheckboxDiv, 'click')
      .subscribe((clickEvent) => {

        if (this.rateioService.quantiaFormControlReferencia) {
          return;
        }

        clickEvent.preventDefault();

        document
          .querySelector('div#nullQuantiaFormControlValueCol')
          ?.animate(
            SIDEWAYS_SHAKE.keyframes,
            SIDEWAYS_SHAKE.options
          );
      });
  }

  private inicializarValorAcao(): void {

    const quantiaFormControl =
      this.formAcao.controls.valorEstimadoAcaoPrincipal;

    console.log(
      '4 - VALOR ESTIMADO AÇÃO PRINCIPAL:',
      quantiaFormControl.value
    );

    quantiaFormControl.valueChanges
      .pipe(
        startWith(quantiaFormControl.value)
      )
      .subscribe((quantiaValue) => {
        this.rateioService
          .quantiaFormControlReferencia$
          .next(quantiaValue);
      });
  }

  private inicializarTodoEstado(): void {

    const controlIndex =
      this.rateioService
        .buscarIndiceControleRateioLocalidadeFormGroup(1);

    this.todoEstadoCheckbox =
      controlIndex !== -1;

    // this.notificarTodoEstadoChange();

  }

  public expandirMicrorregiaoAccordionItem(
    idLocalidade: number
  ): void {

    const accordionItemId =
      `rateio-microrregiao-accordion-item-${idLocalidade}`;

    setTimeout(() => {

      if (
        !this.rateioNgbAccordion
          .isExpanded(accordionItemId)
      ) {
        this.rateioNgbAccordion
          .expand(accordionItemId);
      }

    }, 0);

  }

  public notificarTodoEstadoChange(): void {

    this.rateioService
      .estadoBooleanCheckboxChange$
      .next(this.todoEstadoCheckbox);

  }

  public notificarDistribuicaoLinearChange(): void {

    this.rateioService
      .distribuicaoLinearCheckboxChange$
      .next(this.distribuicaoLinearCheckbox);
  }

}