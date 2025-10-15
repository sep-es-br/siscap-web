
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskDirective } from 'ngx-mask';
import { TemplatesModule } from '../../../shared/templates/templates.module';

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
export class ProjetoParecerComponent implements OnInit {

  @Input() public pareceresProjeto: IEquipe[] = [];

  public parecerForm: FormGroup = new FormGroup({});
  isSubepp: boolean = false;
  isSubeo: boolean = true;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.parecerForm = this.fb.group({
      textoParecer: ['', [Validators.required, Validators.maxLength(2000)]],
      statusParecer: [{ value: 'Pendente', disabled: true }],
      dataEnvioParecer: [{ value: '', disabled: true }]
    });
  }


}
