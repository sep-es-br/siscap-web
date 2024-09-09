import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective } from 'ngx-mask';

import { CoreModule } from '../../core/core.module';
import { OrganizacoesListComponent } from './list/organizacoes-list.component';
import { OrganizacoesFormComponent } from './form/organizacoes-form.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [OrganizacoesListComponent, OrganizacoesFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    NgSelectModule,
    NgxMaskDirective,
    NgbPaginationModule,
  ],
  exports: [OrganizacoesListComponent, OrganizacoesFormComponent],
})
export class OrganizacoesModule {}
