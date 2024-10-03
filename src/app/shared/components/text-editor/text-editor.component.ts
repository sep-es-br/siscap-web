import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'siscap-text-editor',
  standalone: true,
  imports: [CommonModule, QuillEditorComponent],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
})
export class TextEditorComponent {}
