import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective } from 'ngx-mask';
import {
  NgbAlertModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

import { CoreModule } from '../../core/core.module';

import { OrganizacoesComponent } from './organizacoes.component';
import { OrganizacoesListComponent } from './list/organizacoes-list.component';
import { OrganizacaoFormComponent } from './form/organizacao-form.component';

@NgModule({
  declarations: [
    OrganizacoesComponent,
    OrganizacoesListComponent,
    OrganizacaoFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    NgSelectModule,
    NgxMaskDirective,
    NgbPaginationModule,
    NgbAlertModule,
  ],
  exports: [
    OrganizacoesComponent,
    OrganizacoesListComponent,
    OrganizacaoFormComponent,
  ],
})
export class OrganizacoesModule {}
