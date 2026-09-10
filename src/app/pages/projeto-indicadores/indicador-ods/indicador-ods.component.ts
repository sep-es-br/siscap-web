import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IIndicadoresCatalogoExterno, IOdsIndicadorExterno } from '../../../core/interfaces/indicadores-catalogo-externo.interface';
import { CommonModule } from '@angular/common';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { OdsService } from '../../../core/services/ods/ods.service';
import { IOdsGestao } from '../../../core/interfaces/ods-gestao.interface';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';

declare var bootstrap: any;

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

  odsTodas: IOdsGestao[] = [];
  ods: IOdsGestao[] = []; // sugeridas visíveis na tela
  odsEscolhidas: IOdsIndicadorExterno[] = [];
  searchInput: any;
  filtroTexto: string | undefined = '';
  searchVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private odsService: OdsService) { }

  ngOnInit(): void {

    this.formProjeto.get('indicadoresProjeto')?.valueChanges
      .subscribe(valor => {
        this.sincronizarOdsComIndicadores();
      });

    this.montarOdsDisponiveis();

  }

  ngOnChanges(): void {

    if (!this.formProjeto) return;

    const odsProjeto = this.formProjeto.getRawValue().odsProjeto ?? [];

    this.odsEscolhidas = odsProjeto.map((ods: any) => {
      const odsAnterior = this.odsEscolhidas?.find(o => o.odsId === ods.odsId);

      return {
        idOdsProjeto: ods.idOdsProjeto ?? null,
        odsId: ods.odsId,
        odsOrdem: ods.odsOrdem,
        odsNome: ods.odsNome,
        odsDescricao: ods.odsDescricao,
        odsCor: ods.odsCor,
        indicadoresVinculados: odsAnterior?.indicadoresVinculados ?? ods.indicadoresVinculados ?? []
      };
    });

  }

  montarOdsDisponiveis(): void {
    this.odsService.buscarOds()
      .subscribe({
        next: (ods) => {
          this.odsTodas = ods ?? [];
          this.sincronizarOdsComIndicadores();
        },
        error: (erro) => {
          console.error('Erro ao carregar ODS', erro);
          this.ods = [];
        }
      });
  }

  adicionarOds(ods: IOdsGestao): void {

    if (!this.isModoEdicao) return;

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
        odsOrdem: [ods.ordemOds],
        odsNome: [ods.nomeOds],
        odsDescricao: [ods.descricaoOds],
        odsCor: [ods.corOds]
      })
    );

    this.odsEscolhidas = [
      ...this.odsEscolhidas,
      {
        idOdsProjeto: null,
        idOdsIndicadorExterno: 0,
        idOdsExterno: ods.odsId,
        odsId: ods.odsId,
        odsOrdem: ods.ordemOds,
        odsNome: ods.nomeOds,
        odsDescricao: ods.descricaoOds,
        odsCor: ods.corOds,
        indicadoresVinculados: []
      }
    ];

    this.atualizarOdsSugeridas();

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

    this.atualizarOdsSugeridas();

  }

  get indicadoresProjeto(): any[] {
    return this.formProjeto?.get('indicadoresProjeto')?.value ?? [];
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.formProjeto.get(controlName) as AbstractControl<any, any>;
  }

  voltarParaIndicadores() {

    const tabTrigger = document.getElementById('nav-indicadores');

    if (tabTrigger) {
      const tab = new bootstrap.Tab(tabTrigger);
      tab.show();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

  }

  private sincronizarOdsComIndicadores(): void {

    const odsProjetoArray = this.formProjeto.get('odsProjeto') as FormArray;
    const odsProjetoAtual = odsProjetoArray?.getRawValue() ?? [];
    const indicadores = this.formProjeto.get('indicadoresProjeto')?.getRawValue() ?? [];

    const odsPorId = new Map<number, IOdsIndicadorExterno>();

    odsProjetoAtual
      .filter((ods: any) => ods.idOdsProjeto != null)
      .forEach((ods: any) => {

        const odsId = Number(ods.odsId);

        odsPorId.set(odsId, {
          idOdsProjeto: ods.idOdsProjeto,
          idOdsIndicadorExterno: ods.idOdsIndicadorExterno ?? null,
          idOdsExterno: ods.idOdsExterno ?? ods.odsId,
          odsId,
          odsOrdem: ods.odsOrdem,
          odsNome: ods.odsNome,
          odsDescricao: ods.odsDescricao,
          odsCor: ods.odsCor,
          indicadoresVinculados: Array.isArray(ods.indicadoresVinculados)
            ? ods.indicadoresVinculados
            : []
        });

      });

    indicadores.forEach((indicador: IIndicadoresCatalogoExterno) => {

      const odsDoIndicador = indicador.ods ?? [];

      odsDoIndicador.forEach((odsIndicador: IOdsIndicadorExterno) => {

        const odsId = this.obterOdsId(odsIndicador);

        if (odsId == null) {
          return;
        }

        // if (odsPorId.has(odsId)) {
        //   const existente = odsPorId.get(odsId);
        //   if (!existente) {
        //     console.warn('ODS existente não encontrado');
        //     return;
        //   }
        //   existente.indicadoresVinculados.push(indicador);
        //   return;
        // }

        if (odsPorId.has(odsId)) {

          const existente = odsPorId.get(odsId);
        
          if (!existente) {
            return;
          }
        
          if (!Array.isArray(existente.indicadoresVinculados)) {
            existente.indicadoresVinculados = [];
          }
        
          const jaVinculado = existente.indicadoresVinculados.some(
            (i: any) =>
              (i.idIndicadorExterno ?? i.idIndicadorCatalogoExterno ?? i.idIndicador) ===
              (indicador.idIndicador ?? indicador.idIndicadorProjeto ?? indicador.idIndicador)
          );
        
          if (!jaVinculado) {
            existente.indicadoresVinculados.push(indicador);
          }
        
          return;
          
        }

        const odsCatalogo = this.odsTodas.find(o => Number(o.odsId) === odsId);

        if (!odsCatalogo) {
          return;
        }

        odsPorId.set(
          odsId,
          this.montarOdsEscolhida(odsCatalogo, [indicador])
        );

      });
    });

    this.odsEscolhidas = Array.from(odsPorId.values());

    this.atualizarFormOdsProjeto();

    this.atualizarOdsSugeridas();

  }

  private obterOdsId(ods: any): number | null {
    const valor = ods?.odsId
      ?? ods?.idOdsExterno
      ?? ods?.idOdsIndicadorExterno
      ?? ods?.id;
    const id = Number(valor);

    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private montarOdsEscolhida(
    odsGestao: IOdsGestao,
    indicadoresVinculados: IIndicadoresCatalogoExterno[]
  ): IOdsIndicadorExterno {

    return {
      idOdsProjeto: null as any,
      idOdsIndicadorExterno: null as any,
      idOdsExterno: odsGestao.odsId,
      odsId: odsGestao.odsId,
      odsOrdem: odsGestao.ordemOds,
      odsNome: odsGestao.nomeOds,
      odsDescricao: odsGestao.descricaoOds,
      odsCor: odsGestao.corOds,
      indicadoresVinculados
    };

  }

  private atualizarFormOdsProjeto(): void {

    const odsProjetoArray = this.formProjeto.get('odsProjeto') as FormArray;

    while (odsProjetoArray.length) {
      odsProjetoArray.removeAt(0, { emitEvent: false });
    }

    this.odsEscolhidas.forEach(ods => {
      odsProjetoArray.push(
        this.fb.group({
          idOdsProjeto: [ods.idOdsProjeto ?? null],
          odsId: [ods.odsId],
          odsOrdem: [ods.odsOrdem],
          odsNome: [ods.odsNome],
          odsDescricao: [ods.odsDescricao],
          odsCor: [ods.odsCor],
          indicadoresVinculados: ods.indicadoresVinculados ?? []
        })
      );
    });

  }

  private atualizarOdsSugeridas(): void {
    const idsSelecionados = new Set(
      this.odsEscolhidas.map(ods => ods.odsId)
    );
    this.ods = this.odsTodas.filter(
      ods => !idsSelecionados.has(ods.odsId)
    );
  }

  concluirDIC() {
  }

  limparBusca(): void {
    if (this.somenteLeitura) {
      return;
    }
    this.filtroTexto = '';
    this.filtrarOds();
    this.searchInput?.nativeElement.focus();
  }

  get somenteLeitura(): boolean {
    return !this.podeEditarOds;
  }

  get podeEditarOds(): boolean {

    const status = this.statusProjeto;

    const isEmElaboracao =
      status === StatusProjetoEnum.Em_Elaboracao;

    const isEmAnalise =
      status === StatusProjetoEnum.Em_Analise;

    const podeEditar =
      isEmElaboracao || (isEmAnalise && (this.isSubcap ?? false));

    return podeEditar;

  }

  filtrarOds(): void {
    const termo = this.filtroTexto
      ? this.filtroTexto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : '';
    this.ods = this.odsTodas.filter(o => {
      const nomeNormalizado = o.nomeOds
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return nomeNormalizado?.includes(termo);
    });
  }

  toggleSearch(): void {
    if (this.somenteLeitura) {
      return;
    }
    this.searchVisible = !this.searchVisible;
    if (this.searchVisible) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      });
    }
  }

  irParaPlanejamento() {

    const tabTrigger = document.getElementById('nav-planejamento');

    if (tabTrigger) {
      const tab = new bootstrap.Tab(tabTrigger);
      tab.show();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

  }


}
