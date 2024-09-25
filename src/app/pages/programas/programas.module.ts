import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective } from 'ngx-mask';
import {
  NgbAlertModule,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../../shared/shared.module';

import { ProgramasComponent } from './programas.component';
import { ProgramaFormComponent } from './form/programa-form.component';
import { ProgramasListComponent } from './list/programas-list.component';

import { ProgramasRoutingModule } from './programas-routing.module';

@NgModule({
  declarations: [
    ProgramasComponent,
    ProgramasListComponent,
    ProgramaFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    NgxMaskDirective,
    NgbPaginationModule,
    NgbAlertModule,
    NgbTooltipModule,
    ProgramasRoutingModule,
  ],
  exports: [ProgramasComponent, ProgramasListComponent, ProgramaFormComponent],
})
export class ProgramasModule {}
