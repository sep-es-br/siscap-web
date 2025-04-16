import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { fromEvent } from 'rxjs';
import {
  NgbAccordionDirective,
  NgbAccordionModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskPipe } from 'ngx-mask';

import { RateioMicrorregiaoFormCardComponent } from './rateio-microrregiao-form-card/rateio-microrregiao-form-card.component';
import { RateioMunicipioFormCardComponent } from './rateio-municipio-form-card/rateio-municipio-form-card.component';

import { RateioService } from '../../../core/services/rateio/rateio.service';

import { SIDEWAYS_SHAKE } from '../../../core/utils/animations';

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
  templateUrl: './rateio-form.component.html',
  styleUrl: './rateio-form.component.scss',
})
export class RateioFormComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbAccordionDirective)
  public rateioNgbAccordion!: NgbAccordionDirective;
  @Input() public isModoEdicao: boolean = false;

  public estadoBooleanCheckbox: boolean = false;

  constructor(public rateioService: RateioService) {}

  ngOnInit(): void {
    const controlIndex =
      this.rateioService.buscarIndiceControleRateioLocalidadeFormGroup(1);

    if (controlIndex !== -1) {
      this.estadoBooleanCheckbox = true;
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
