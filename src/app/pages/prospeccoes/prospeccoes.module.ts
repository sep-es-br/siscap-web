import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import {
  NgbAlertModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../../shared/shared.module';

import { ProspeccoesComponent } from './prospeccoes.component';
import { ProspeccoesListComponent } from './list/prospeccoes-list.component';
import { ProspeccaoFormComponent } from './form/prospeccao-form.component';
import { ProspeccaoViewComponent } from './view/prospeccao-view.component';

import { ProspeccoesRoutingModule } from './prospeccoes-routing.module';

@NgModule({
  declarations: [
    ProspeccoesComponent,
    ProspeccoesListComponent,
    ProspeccaoFormComponent,
    ProspeccaoViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgbPaginationModule,
    NgbAlertModule,
    ProspeccoesRoutingModule,
  ],
  exports: [
    ProspeccoesComponent,
    ProspeccoesListComponent,
    ProspeccaoFormComponent,
    ProspeccaoViewComponent,
  ],
})
export class ProspeccoesModule {}
