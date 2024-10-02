import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import {
  NgbAlertModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

import { ProjetosComponent } from './projetos.component';
import { ProjetosListComponent } from './list/projetos-list.component';
import { ProjetoFormComponent } from './form/projeto-form.component';

import { SharedModule } from '../../shared/shared.module';
import { ProjetosRoutingModule } from './projetos-routing.module';

@NgModule({
  declarations: [
    ProjetosComponent,
    ProjetosListComponent,
    ProjetoFormComponent,
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
    ProjetosRoutingModule,
  ],
  exports: [ProjetosComponent, ProjetosListComponent, ProjetoFormComponent],
})
export class ProjetosModule {}
