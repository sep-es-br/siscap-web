import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';

import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

import { RateioMicrorregiaoItemCardComponent } from './rateio-microrregiao-item-card/rateio-microrregiao-item-card.component';

import { RateioService } from '../../../shared/services/projetos/rateio.service';

import { IMicrorregiaoCidadesSelectList } from '../../../shared/interfaces/select-list.interface';
import { ErrorMessageMap } from '../../../shared/utils/error-messages-map';
import { RateioFormModel } from '../../../shared/models/rateio.model';

@Component({
  selector: 'siscap-rateio-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    RateioMicrorregiaoItemCardComponent,
  ],
  templateUrl: './rateio-form.component.html',
  styleUrls: ['./rateio-form.component.scss'],
})
export class RateioFormComponent implements OnChanges {
  @Input({ alias: 'context', required: true }) public context: string = '';
  @Input({ alias: 'formMode', required: true }) public formMode: string = '';
  @Input({ alias: 'isEdit', required: true }) public isEdit: boolean = false;
  @Input({ alias: 'targetRateioArray', required: true })
  public targetRateioArray: FormArray<FormGroup<RateioFormModel>> =
    new FormArray<FormGroup<RateioFormModel>>([]);
  @Input({ alias: 'listArrays', required: true }) public selectListArrayArgs: {
    [key: string]: Array<IMicrorregiaoCidadesSelectList>;
  } = {};

  public formGroupLabel: string = '';

  public microrregioesCidadesList: Array<IMicrorregiaoCidadesSelectList> = [];

  constructor(public rateioService: RateioService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.microrregioesCidadesList =
      this.selectListArrayArgs['microrregioesCidadesList'];

    this.rateioService.microrregioesCidadesList = this.microrregioesCidadesList;
  }

  public getErrorMessage(validationErrors: ValidationErrors | null): string {
    if (validationErrors) {
      return Object.keys(validationErrors)
        .map(
          (controlError) =>
            ErrorMessageMap[controlError as keyof typeof ErrorMessageMap]
        )
        .join(', ');
    }

    return '';
  }

  public notificarCalculoAutomaticoObs(tipo: string): void {
    this.rateioService.calculoAutomaticoObs$.next(tipo);
  }
}
