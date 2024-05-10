import { Component, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'siscap-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  @ViewChild('navmenuOffcanvas') navmenuOffcanvas!: TemplateRef<any>;
}
