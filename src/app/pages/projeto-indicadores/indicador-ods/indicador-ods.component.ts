import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IOdsIndicadorExterno } from '../../../core/interfaces/indicadores-catalogo-externo.interface';
import { CommonModule } from '@angular/common';
import { TemplatesModule } from '../../../shared/templates/templates.module';

@Component({
  selector: 'siscap-indicador-ods',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TemplatesModule],
  templateUrl: './indicador-ods.component.html',
  styleUrl: './indicador-ods.component.scss'
})
export class IndicadorOdsComponent implements OnInit {
  @Input() formProjeto!: FormGroup;
  @Input() isModoEdicao?: boolean = false;
  @Input() isSubcap?: boolean = false;
  @Input() statusProjeto?: string = '';

  ods: IOdsIndicadorExterno[] = [];
  odsEscolhidas: IOdsIndicadorExterno[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {

    this.formProjeto
      ?.get('indicadoresProjeto')
      ?.valueChanges
      .subscribe((value: any) => {
        this.montarOdsDisponiveis();
      });

    this.montarOdsDisponiveis();

  }

  ngOnChanges(): void {

    if (!this.formProjeto) return;

    const odsProjeto = this.formProjeto.getRawValue().odsProjeto ?? [];

    this.odsEscolhidas = odsProjeto.map((ods: any) => ({
      idOdsProjeto: ods.idOdsProjeto ?? null,
      odsId: ods.odsId,
      odsOrdem: ods.odsOrdem,
      odsNome: ods.odsNome,
      odsDescricao: ods.odsDescricao,
      odsCor: ods.odsCor
    }));

  }

  montarOdsDisponiveis(): void {

    const indicadores = this.formProjeto?.get('indicadoresProjeto')?.value ?? [];
    const odsPorId = new Map<number, any>();

    indicadores.forEach((indicador: any) => {
      const odsDoIndicador = indicador.ods ?? [];

      odsDoIndicador.forEach((ods: any) => {
        const odsExistente = odsPorId.get(ods.odsId);

        const indicadorVinculado = {
          idIndicador: indicador.idIndicadorExterno,
          nomeIndicador: indicador.nomeIndicador
        };

        if (odsExistente) {
          odsExistente.indicadoresVinculados.push(indicadorVinculado);
        } else {
          odsPorId.set(ods.odsId, {
            ...ods,
            indicadoresVinculados: [indicadorVinculado]
          });
        }
      });
    });

    this.ods = Array.from(odsPorId.values());

  }

  adicionarOds(ods: IOdsIndicadorExterno): void {

    const odsProjeto = this.formProjeto.get('odsProjeto') as FormArray;

    const jaExiste = odsProjeto.value.some(
      (item: any) => item.odsId === ods.odsId
    );

    if (jaExiste) {
      return;
    }

    odsProjeto.push(
      this.fb.group({
        idOdsProjeto: [null],
        odsId: [ods.odsId],
        odsOrdem: [ods.odsOrdem],
        odsNome: [ods.odsNome],
        odsDescricao: [ods.odsDescricao],
        odsCor: [ods.odsCor]
      })
    );

    this.odsEscolhidas = odsProjeto.value;

  }

  removerOds(ods: IOdsIndicadorExterno): void {

    this.odsEscolhidas = this.odsEscolhidas
      .filter(o => o.odsId !== ods.odsId);

    const odsProjetoArray = this.formProjeto.get('odsProjeto') as FormArray;

    const index = odsProjetoArray.controls.findIndex(control =>
      control.get('odsId')?.value === ods.odsId
    );

    if (index >= 0) {
      odsProjetoArray.removeAt(index);
    }

  }

  get indicadoresProjeto(): any[] {
    return this.formProjeto?.get('indicadoresProjeto')?.value ?? [];
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.formProjeto.get(controlName) as AbstractControl<any, any>;
  }

}
