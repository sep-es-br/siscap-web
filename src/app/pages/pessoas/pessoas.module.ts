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

import { PessoasComponent } from './pessoas.component';
import { PessoasListComponent } from './list/pessoas-list.component';
import { PessoaFormComponent } from './form/pessoa-form.component';
import { MeuPerfilComponent } from './meu-perfil/meu-perfil.component';

import { PessoasRoutingModule } from './pessoas-routing.module';

@NgModule({
  declarations: [
    PessoasComponent,
    PessoasListComponent,
    PessoaFormComponent,
    MeuPerfilComponent,
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
    PessoasRoutingModule,
  ],
  exports: [
    PessoasComponent,
    PessoasListComponent,
    PessoaFormComponent,
    MeuPerfilComponent,
  ],
})
export class PessoasModule {}
