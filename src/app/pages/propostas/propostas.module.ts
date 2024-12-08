import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import {
  NgbAlertModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

import { PropostasComponent } from './propostas.component';
import { PropostasListComponent } from './list/propostas-list.component';
import { PropostaFormComponent } from './form/proposta-form.component';

import { SharedModule } from '../../shared/shared.module';
import { PropostasRoutingModule } from './propostas-routing.module';

@NgModule({
  declarations: [
    PropostasComponent,
    PropostasListComponent,
    PropostaFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgbPaginationModule,
    NgbAlertModule,
    PropostasRoutingModule,
  ],
  exports: [PropostasComponent, PropostasListComponent, PropostaFormComponent],
})
export class PropostasModule {}
