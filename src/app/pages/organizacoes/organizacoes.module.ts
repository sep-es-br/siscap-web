import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective } from 'ngx-mask';
import {
  NgbAlertModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../../shared/shared.module';

import { OrganizacoesComponent } from './organizacoes.component';
import { OrganizacoesListComponent } from './list/organizacoes-list.component';
import { OrganizacaoFormComponent } from './form/organizacao-form.component';

import { OrganizacoesRoutingModule } from './organizacoes-routing.module';

@NgModule({
  declarations: [
    OrganizacoesComponent,
    OrganizacoesListComponent,
    OrganizacaoFormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxMaskDirective,
    NgbPaginationModule,
    NgbAlertModule,
    OrganizacoesRoutingModule,
  ],
  exports: [
    OrganizacoesComponent,
    OrganizacoesListComponent,
    OrganizacaoFormComponent,
  ],
})
export class OrganizacoesModule {}
