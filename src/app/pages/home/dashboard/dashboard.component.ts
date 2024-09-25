import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

import { IDashboardProjeto } from '../../../core/interfaces/dashboard.interface';

import { abbreviateNumber } from 'js-abbreviation-number';

@Component({
  selector: 'siscap-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _subscription: Subscription = new Subscription();

  dados?: IDashboardProjeto;
  valorEstimadoTotal?: string;
  simbolos: { symbols: string[] } = {
    symbols: ['', ' mil', ' mi', ' bi', ' tri', ' qua', ' qui'],
  };

  constructor(private _dashboardService: DashboardService) {}

  ngOnInit() {
    this._dashboardService.getQuantidadeProjetos().subscribe((response) => {
      this.dados = response;
      this.valorEstimadoTotal = abbreviateNumber(
        this.dados.valorTotal,
        1,
        this.simbolos
      );
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
