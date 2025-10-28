
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
import { LotacaoUsuarioEnum } from '../../../core/enums/lotacao-usuario.enum';
import { StatusParecerEnum } from '../../../core/enums/status-parecer.enum';

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
  @Input() lotacaoUsuario!: number;
  
  constructor(
    private fb: FormBuilder
  ) { }

  get parecerFormGroup(): FormGroup {
    return this.projetoForm.get('parecerProjeto') as FormGroup;
  }

  get statusProjetoFormGroup(): FormGroup {
    return this.projetoForm.get('statusProjeto') as FormGroup;
  }

  get dataEnvio(): any {
    return this.projetoForm.get('dataEnvio')?.value;
  }
  
  get usuarioFezEnvioParecer(): any {
    return this.projetoForm.get('usuarioFezEnvioParecer')?.value;
  }
  
  public isSubepp(): boolean {
    return this.lotacaoUsuario == LotacaoUsuarioEnum.SUBEPP;
  }

  public isSubeo(): boolean {
    return this.lotacaoUsuario == LotacaoUsuarioEnum.SUBEO;
  }

  public isEnviado(): boolean {
    const statusParecer = this.parecerFormGroup.get('statusParecer')?.value;
    return statusParecer === StatusParecerEnum.Enviado
  }

  ngOnInit(): void {

    const textoParecer = this.parecerFormGroup.get('textoParecer');

    if (this.statusProjeto == StatusProjetoEnum.Em_Parecer_Estrategico_Orcamentario) {
      textoParecer?.setValidators([Validators.required]);
    } else {
      textoParecer?.clearValidators();
    }

    textoParecer?.updateValueAndValidity();

    // const statusParecer = this.parecerFormGroup.get('statusParecer')?.value;
    // if ( statusParecer === StatusParecerEnum.Enviado) {
    //   setTimeout(() => this.parecerFormGroup.get('textoParecer')?.disable(), 2000);
    // } else {
    //   setTimeout(() => this.parecerFormGroup.get('textoParecer')?.enable(), 2000);
    // }

  }

}
