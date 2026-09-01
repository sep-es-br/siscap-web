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

  @Input() public isModoEdicao: boolean = false;

  public estadoBooleanCheckbox: boolean = false;

  @Input({ required: true }) formAcao!: FormGroup<AcaoFormType>;

  @Input({ required: true })
  public localidadesOpcoes!: Array<ILocalidadeOpcoesDropdown>;

  constructor(public rateioService: RateioService) { }

  ngOnInit(): void {

    // Alimenta a instância PARTICULAR do RateioService
    // com a lista compartilhada de localidades.
    this.rateioService.localidadesOpcoes =
      this.localidadesOpcoes;

    const quantiaFormControl =
      this.formAcao.controls.valorEstimadoAcaoPrincipal;

    quantiaFormControl.valueChanges
      .pipe(
        startWith(quantiaFormControl.value)
      )
      .subscribe((quantiaValue) => {

        this.rateioService
          .quantiaFormControlReferencia$
          .next(quantiaValue);
      });


    // const quantiaFormControl =
    //   this.formAcao.controls.valorEstimadoAcaoPrincipal;

    // manda o valor inicial
    this.rateioService.quantiaFormControlReferencia$.next(
      quantiaFormControl.value
    );

    // acompanha alterações
    quantiaFormControl.valueChanges.subscribe((quantiaValue) => {
      console.log(
        'valorEstimadoAcaoPrincipal alterado:',
        quantiaValue
      );
      this.rateioService.quantiaFormControlReferencia$.next(
        quantiaValue
      );
    });

    const controlIndex =
      this.rateioService.buscarIndiceControleRateioLocalidadeFormGroup(1);

    if (controlIndex !== -1) {
      this.estadoBooleanCheckbox = false;
      this.notificarEstadoCheckboxChange();
    }

  }

  ngAfterViewInit(): void {
    const estadoCheckboxDiv = document.querySelector('div#estado-checkbox-div');

    if (estadoCheckboxDiv) {
      fromEvent(estadoCheckboxDiv, 'click').subscribe((clickEvent) => {
        if (!this.rateioService.quantiaFormControlReferencia) {
          clickEvent.preventDefault();
          document
            .querySelector('div#nullQuantiaFormControlValueCol')
            ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
        }
      });
    }
  }

  public expandirMicrorregiaoAccordionItem(idLocalidade: number): void {
    const accordionItemId = `rateio-microrregiao-accordion-item-${idLocalidade}`;

    setTimeout(() => {
      if (!this.rateioNgbAccordion.isExpanded(accordionItemId))
        this.rateioNgbAccordion.expand(accordionItemId);
    }, 0);
  }

  public notificarEstadoCheckboxChange(): void {
    this.rateioService.estadoBooleanCheckboxChange$.next(
      this.estadoBooleanCheckbox
    );
  }
}
