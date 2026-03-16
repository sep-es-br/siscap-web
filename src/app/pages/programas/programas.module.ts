import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
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
import { ProgramaAssinaturasComponent } from './assinaturas/programa-assinaturas.component';
import { OrgaosPapeisFormComponent } from '../../shared/components/orgaos-papeis-form/orgaos-papeis-form.component';

@NgModule({
  declarations: [
    ProgramasComponent,
    ProgramasListComponent,
    ProgramaFormComponent,
    ProgramaAssinaturasComponent,
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
    NgbTooltipModule,
    ProgramasRoutingModule,
    OrgaosPapeisFormComponent,
  ],
  exports: [
    ProgramasComponent,
    ProgramasListComponent,
    ProgramaFormComponent,
    ProgramaAssinaturasComponent,
  ],
})
export class ProgramasModule {}
