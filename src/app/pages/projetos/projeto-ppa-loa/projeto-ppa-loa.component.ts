import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-projeto-ppa-loa',
  standalone: true,
  imports: [],
  templateUrl: './projeto-ppa-loa.component.html',
  styleUrl: './projeto-ppa-loa.component.scss'
})
export class ProjetoPpaLoaComponent {

  acoesPlanejamento: PlanejamentoAcao[] = [];
  filtrosPlanejamento: PlanejamentoFiltroAplicado[] = [];

  naoPrevistoPpa = false;

  constructor(private readonly _ngbModalService: NgbModal) {}

  abrirModalFiltrosPlanejamento(modalTemplateRef: any): void {
    const modalRef = this._ngbModalService.open(modalTemplateRef, {
      centered: true,
    });
    modalRef.result.then(
      (result) => {
        // this.alterarStatusProjeto(result);
      },
      (reject) => { },
    );
  }

  removerAcaoPlanejamento(acao: PlanejamentoAcao): void {
    this.acoesPlanejamento = this.acoesPlanejamento.filter(
      item => item.id !== acao.id,
    );
  }

  removerFiltroPlanejamento(
    filtro: PlanejamentoFiltroAplicado,
  ): void {
    this.filtrosPlanejamento = this.filtrosPlanejamento.filter(
      item => item.id !== filtro.id,
    );
  }

  alterarNaoPrevistoPpa(naoPrevisto: boolean): void {
    this.naoPrevistoPpa = naoPrevisto;
  }

}
