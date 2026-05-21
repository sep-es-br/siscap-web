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
import { ProjetosSearchComponent } from './search/projetos-search.component';
import { IndicadoresFormComponent } from '../../shared/components/indicadores-form/indicadores-form.component';
import { AcoesFormComponent } from '../../shared/components/acoes-form/acoes-form.component';
import { ProjetoParecerComponent } from './projeto-parecer/projeto-parecer.component';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressoButtonComponent } from '../../shared/components/progresso-button/progresso-button.component';
import { ProjetoIndicadoresComponent } from "../projeto-indicadores/projeto-indicadores.component";

@NgModule({
  declarations: [
    ProjetosComponent,
    ProjetosListComponent,
    ProjetoFormComponent,
    ProjetosSearchComponent,
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
    ReactiveFormsModule,
    ProjetoParecerComponent,
    TimelineModule,
    TooltipModule,
    ProjetoIndicadoresComponent,
    ProgressoButtonComponent
],
  exports: [
    ProjetosComponent,
    ProjetosListComponent,
    ProjetoFormComponent,
    ProjetosSearchComponent

  ],
})
export class ProjetosModule {}
