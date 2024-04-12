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
  @ViewChild('dashboardContainer')
  dashboardContainer!: ElementRef<HTMLDivElement>;

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
    const embedDashboardParams = this._dashboardService.getEmbedDashboardParams(
      this.dashboardContainer.nativeElement,
      this._dashboardUiConfig
    );

    embedDashboard(embedDashboardParams).then((dashboard) => {
      const iframeEl =
        this.dashboardContainer.nativeElement.querySelector('iframe')!;

      iframeEl.style.width = '100%';
      iframeEl.style.height = '79.3vh';
    });
  }
}
