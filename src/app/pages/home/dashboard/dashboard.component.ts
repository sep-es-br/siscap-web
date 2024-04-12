import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { UiConfigType, embedDashboard } from '@superset-ui/embedded-sdk';

import { DashboardService } from '../../../shared/services/dashboard/dashboard.service';

@Component({
  selector: 'siscap-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('dashboardContainerDesktop')
  dashboardContainerDesktop!: ElementRef<HTMLDivElement>;
  @ViewChild('dashboardContainerMobile')
  dashboardContainerMobile!: ElementRef<HTMLDivElement>;

  private _dashboardUiConfig: UiConfigType;

  constructor(private _dashboardService: DashboardService) {
    this._dashboardUiConfig = {
      hideTitle: true,
      // hideTab: true,
      hideChartControls: true,
      filters: {
        expanded: false,
        visible: false,
      },
    };
  }

  ngAfterViewInit(): void {
    this.embedDashboardToContainer(false); // Inicializa dashboard para o viewport Desktop (width > 768px)
    this.embedDashboardToContainer(true); // Inicializa dashboard para o viewport Mobile (width < 767px)
  }

  private embedDashboardToContainer(isMobile: boolean): void {
    const dashboardContainer = isMobile
      ? this.dashboardContainerMobile.nativeElement
      : this.dashboardContainerDesktop.nativeElement;

    const embedDashboardParams = this._dashboardService.getEmbedDashboardParams(
      dashboardContainer,
      isMobile,
      this._dashboardUiConfig
    );

    embedDashboard(embedDashboardParams).then((dashboard) => {
      const iframeEl = dashboardContainer.querySelector('iframe')!;
      iframeEl.style.width = '100%';
      iframeEl.style.height = isMobile ? '74vh' : '79.3vh';
    });
  }
}
