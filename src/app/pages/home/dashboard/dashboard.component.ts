import { Component, OnInit } from '@angular/core';

import { tap } from 'rxjs';

import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

import { abbreviateNumber } from 'js-abbreviation-number';

// 12/02/2025
// ALTERACOES PROVISORIAS APENAS PARA APRESENTACAO; A SEREM REMOVIDAS POSTERIORMENTE

@Component({
  selector: 'siscap-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly _simbolos: { symbols: Array<string> } = {
    symbols: ['', ' mil', ' mi', ' bi', ' tri', ' qua', ' qui'],
  };

  public projetosQuantidade: number = 0;
  public projetosValorEstimadoTotal: string = '';

  public programasQuantidade: number = 0;

  public cartasConsultaQuantidade: number = 0;

  constructor(private readonly _dashboardService: DashboardService) {}

  ngOnInit() {
    this._dashboardService
      .buscarDadosDashboard()
      .pipe(
        tap((response) => {
          this.projetosQuantidade = response.projetosQuantidade;
          this.projetosValorEstimadoTotal = abbreviateNumber(
            response.projetosValorTotal,
            1,
            this._simbolos
          );
          this.programasQuantidade = response.programasQuantidade;
          this.cartasConsultaQuantidade = response.cartasConsultaQuantidade;
        })
      )
      .subscribe();
  }
}
