import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import {
  NgbAccordionModule,
  NgbAlertModule,
  NgbDatepickerModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

import { ProjetosComponent } from './projetos.component';
import { ProjetosListComponent } from './list/projetos-list.component';
import { ProjetoFormComponent } from './form/projeto-form.component';

import { SharedModule } from '../../shared/shared.module';
import { ProjetosRoutingModule } from './projetos-routing.module';
import { ProjetosPesquisaComponent } from './search/projetos-search.component';
import { IndicadoresFormComponent } from "../../shared/components/indicadores-form/indicadores-form.component";
import { AcoesFormComponent } from '../../shared/components/acoes-form/acoes-form.component';

@NgModule({
  declarations: [
    ProjetosComponent,
    ProjetosListComponent,
    ProjetoFormComponent,
    ProjetosPesquisaComponent,
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
    NgbDatepickerModule,
    ProjetosRoutingModule,
    IndicadoresFormComponent,
    AcoesFormComponent,
    ReactiveFormsModule,
    NgbAccordionModule,
    ReactiveFormsModule
],
  exports: [
    ProjetosComponent,
    ProjetosListComponent,
    ProjetoFormComponent,
    ProjetosPesquisaComponent,
  ],
})
export class ProjetosModule {}
