import { Component, input, output } from '@angular/core';

import { tap } from 'rxjs';
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

  //public tableActionInput = input.required<number>();
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

    modalRef.result.then(
      (resolve) => {
        this._projetosService
          .deleteById(projetoTableData.id)
          .pipe(tap((response) => this.dispararModalSucesso(response)))
          .subscribe();
      },
      (reject) => {}
    );
  }

  private dispararModalSucesso(response: string): void {
    const modalRef = this._ngbModalService.open(SuccessModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo = response;

    modalRef.result.then(
      (resolve) => {},
      (reject) => {
        this._navegacaoService.navegacaoComRecarregamento(
          BreadcrumbContextoEnum.Projetos
        );
      }
    );
  }
}
