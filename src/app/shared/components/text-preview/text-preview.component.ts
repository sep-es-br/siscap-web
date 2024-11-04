import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { QuillViewComponent } from 'ngx-quill';

@Component({
  selector: 'siscap-text-preview',
  standalone: true,
  imports: [CommonModule, QuillViewComponent],
  templateUrl: './text-preview.component.html',
  styleUrl: './text-preview.component.scss',
})
export class TextPreviewComponent {
  @Input() public conteudo: string = '';
}
