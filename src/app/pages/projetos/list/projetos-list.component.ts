import { Component, input, output } from '@angular/core';

import { Subject, takeUntil, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { IProjetoTableData } from '../../../core/interfaces/projeto.interface';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';

import { getSimboloMoeda } from '../../../core/utils/functions';
import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { ITableActionOutput, TTableActions } from '../../../shared/templates/table-actions-dropdown/table-actions-dropdown.interface';
import { environment } from '../../../../environments/environment';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';

@Component({
  selector: 'siscap-projetos-list',
  standalone: false,
  templateUrl: './projetos-list.component.html',
  styleUrl: './projetos-list.component.scss',
})
export class ProjetosListComponent {

  public projetosList = input<Array<IProjetoTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();
  public permissaoDeletarAdminAuth: boolean = false;

  private _destroy$ = new Subject<void>();

  public tableActionOutput = output<ITableActionOutput>();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  urlEdocsBase = environment.edocsUrl;

  constructor(
    private readonly _projetosService: ProjetosService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _ngbModalService: NgbModal,
    private readonly _usuarioService: UsuarioService
  ) {
    this.permissaoDeletarAdminAuth =
      this._usuarioService.verificarPermissao('adminAuth');
  }

  projetosAguardando: Set<number> = new Set();

  ngOnInit(): void {

    this._projetosService.projetosAguardandoEdocs$
      .pipe(takeUntil(this._destroy$))
      .subscribe(set => {
        this.projetosAguardando = set;
      });

    this._projetosService.protocoloAtualizado$
      .pipe(
        takeUntil(this._destroy$)
      )
      .subscribe(({ idProjeto, protocolo }) => {
        const projeto = this.projetosList()?.find(p => p.id === idProjeto);
        // if (projeto) {
        //   if (projeto?.protocoloEdocs == null || projeto?.protocoloEdocs.trim() == "")
        //     // projeto.protocoloEdocs = protocolo;
        //     // projeto.status = StatusProjetoEnum.Em_Analise;
        // }
      });

      

  }

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarProjeto(event.id);
        break;

      case 'deletar':
        this.deletarProjeto(event.id);
        break;

      default:
        break;
    }
  }

  public editarProjeto(id: number): void {
    this._projetosService.idProjeto$.next(id);

    this._navegacaoService.navegacaoSimples(
      BreadcrumbContextoEnum.Projetos,
      BreadcrumbAcoesEnum.Editar
    );
  }

  public podeDeletarDic(id: number): boolean {

    const projetoTableData = this.projetosList()?.find(
      (projeto) => projeto.id === id
    );

    if (this.permissaoDeletarAdminAuth) {
      if (projetoTableData?.protocoloEdocs && projetoTableData?.protocoloEdocs.trim() != "") {
        if (projetoTableData?.status == StatusProjetoEnum.Em_Analise || projetoTableData?.status == StatusProjetoEnum.Em_Complementacao || projetoTableData?.status == StatusProjetoEnum.Parecer_SEP)
          return true
        else
          return false
      } else if (projetoTableData?.protocoloEdocs == null || projetoTableData?.protocoloEdocs.trim() == "") {
        return true;
      }
    }
    return false;

  }

  public deletarProjeto(id: number): void {
    const projetoTableData = this.projetosList()?.find(
      (projeto) => projeto.id === id
    );

    this.dispararModalDeletar(projetoTableData!);
  }

  private dispararModalDeletar(projetoTableData: IProjetoTableData): void {

    const modalRef = this._ngbModalService.open(DeleteModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo = `${projetoTableData.sigla} - ${projetoTableData.titulo}`;

    modalRef.componentInstance.exigirJustificativa = projetoTableData.status == StatusProjetoEnum.Em_Analise || projetoTableData.status == StatusProjetoEnum.Em_Complementacao || projetoTableData.status == StatusProjetoEnum.Parecer_SEP;

    modalRef.result.then(
      (resultado) => {
        if (resultado.confirmado) {
          this._projetosService
            .deleteByIdJustificativa(projetoTableData.id, resultado.justificativa)
            .pipe(tap((response) => this.dispararModalSucesso(response)))
            .subscribe();
        }
      },
      (reason) => { }
    );

  }

  private dispararModalSucesso(response: string): void {
    const modalRef = this._ngbModalService.open(SuccessModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo = response;

    modalRef.result.then(
      (resolve) => { },
      (reject) => {
        this._navegacaoService.navegacaoComRecarregamento(
          BreadcrumbContextoEnum.Projetos
        );
      }
    );
  }
}
