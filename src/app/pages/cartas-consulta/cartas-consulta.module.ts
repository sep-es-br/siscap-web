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

import { CartasConsultaComponent } from './cartas-consulta.component';
import { CartasConsultaListComponent } from './list/cartas-consulta-list.component';
import { CartaConsultaFormComponent } from './form/carta-consulta-form.component';
import { CartaConsultaViewComponent } from './view/carta-consulta-view.component';

import { CartasConsultaRoutingModule } from './cartas-consulta-routing.module';

@NgModule({
  declarations: [
    CartasConsultaComponent,
    CartasConsultaListComponent,
    CartaConsultaFormComponent,
    CartaConsultaViewComponent,
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
    CartasConsultaRoutingModule,
  ],
  exports: [
    CartasConsultaComponent,
    CartasConsultaListComponent,
    CartaConsultaFormComponent,
    CartaConsultaViewComponent,
  ],
})
export class CartasConsultaModule {}
