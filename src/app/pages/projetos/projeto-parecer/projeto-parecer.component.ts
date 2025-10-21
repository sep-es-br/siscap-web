
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskDirective } from 'ngx-mask';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { IParecer } from '../../../core/interfaces/parecer.interface';
import { ParecerService } from '../../../core/services/parecer/parecer.service';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';

@Component({
  selector: 'siscap-projeto-parecer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule
  ],
  templateUrl: './projeto-parecer.component.html',
  styleUrl: './projeto-parecer.component.scss'
})
export class ProjetoParecerComponent {

  @Input() projetoForm!: FormGroup;
  @Input() statusProjeto!: string;

  isSubepp: boolean = false;
  isSubeo: boolean = true;

  constructor(
    private fb: FormBuilder
  ) { }

  get parecerFormGroup(): FormGroup {
    return this.projetoForm.get('parecerProjeto') as FormGroup;
  }

  get statusProjetoFormGroup(): FormGroup {
    return this.projetoForm.get('statusProjeto') as FormGroup;
  }

  ngOnInit(): void {

    const textoParecer = this.parecerFormGroup.get('textoParecer');

    if (this.statusProjeto == StatusProjetoEnum.Em_Parecer_Estrategico_Orcamentario) {
      textoParecer?.setValidators([Validators.required]);
    } else {
      textoParecer?.clearValidators();
    }

    textoParecer?.updateValueAndValidity();

  }

}
