import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'button[app-progresso-button]',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule],
  template: `
    <span>{{ label }}</span>
    <i *ngIf="icon" [class]="icon" style="margin-left: 8px;"></i>
  `,
  styleUrl: './progresso-button.component.scss',
})
export class ProgressoButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
}
