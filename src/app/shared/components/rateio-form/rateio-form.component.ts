import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';

import {
  NgbAccordionDirective,
  NgbAccordionModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskPipe } from 'ngx-mask';

import { RateioMicrorregiaoFormCardComponent } from './rateio-microrregiao-form-card/rateio-microrregiao-form-card.component';
import { RateioMunicipioFormCardComponent } from './rateio-municipio-form-card/rateio-municipio-form-card.component';

import { RateioService } from '../../../core/services/rateio/rateio.service';

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
export class RateioFormComponent {
  @ViewChild(NgbAccordionDirective)
  public rateioNgbAccordion!: NgbAccordionDirective;

  @Input() public isModoEdicao: boolean = false;

  constructor(public rateioService: RateioService) {}

  public expandirMicrorregiaoAccordionItem(idLocalidade: number): void {
    const accordionItemId = `rateio-microrregiao-accordion-item-${idLocalidade}`;

    setTimeout(() => {
      if (!this.rateioNgbAccordion.isExpanded(accordionItemId))
        this.rateioNgbAccordion.expand(accordionItemId);
    }, 0);
  }
}
