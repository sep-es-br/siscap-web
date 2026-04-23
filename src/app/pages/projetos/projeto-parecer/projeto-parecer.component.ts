
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IEquipe } from '../../../core/interfaces/equipe.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskDirective } from 'ngx-mask';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { IParecer } from '../../../core/interfaces/parecer.interface';
import { ParecerService } from '../../../core/services/parecer/parecer.service';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { LotacaoUsuarioEnum } from '../../../core/enums/lotacao-usuario.enum';
import { StatusParecerEnum } from '../../../core/enums/status-parecer.enum';
import { Jodit } from 'jodit';
import { paste } from 'jodit/types/plugins/paste/paste';
@Component({
  selector: 'siscap-projeto-parecer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule
  ],
  templateUrl: './projeto-parecer.component.html',
  styleUrl: './projeto-parecer.component.scss'
})
export class ProjetoParecerComponent implements OnInit, AfterViewInit{

  @ViewChild('editor') editorElement!: ElementRef<HTMLTextAreaElement>;

  editor! : Jodit | undefined;

  textoLength = 0;

  @Input() projetoForm!: FormGroup;
  @Input() statusProjeto!: string;
  @Input() lotacaoUsuario!: number;
  @Input() pareceresProjeto!: IParecer[];


  constructor(
    private fb: FormBuilder
  ) { }

  get parecerFormGroup(): FormGroup {
    return this.projetoForm.get('parecerProjetoUsuario') as FormGroup;
  }

  get statusProjetoFormGroup(): FormGroup {
    return this.projetoForm.get('statusProjeto') as FormGroup;
  }

  get dataEnvio(): any {
    return this.projetoForm.get('dataEnvio')?.value;
  }

  get usuarioFezEnvioParecer(): any {
    return this.projetoForm.get('usuarioFezEnvioParecer')?.value;
  }

  public isSubepp(): boolean {
    return this.lotacaoUsuario == LotacaoUsuarioEnum.SUBEPP;
  }

  public isSubeo(): boolean {
    return this.lotacaoUsuario == LotacaoUsuarioEnum.SUBEO;
  }

  public isSubcapGeoc(): boolean {
    return this.lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP;
  }

  public isEnviado(): boolean {
    const statusParecer = this.parecerFormGroup.get('statusParecer')?.value;
    return !(statusParecer === StatusParecerEnum.Pendente)
  }

  ngOnInit(): void {

    const textoParecer = this.parecerFormGroup.get('textoParecer');

    if (this.statusProjeto == StatusProjetoEnum.Parecer_SEP || this.statusProjeto == StatusProjetoEnum.Elegivel ) {
      textoParecer?.setValidators([Validators.required]);
    } else {
      textoParecer?.clearValidators();
    }

    textoParecer?.updateValueAndValidity();

  }

  getPlainTextLength(html: string): number {
    if (!html) return 0;

    const div = document.createElement('div');
    div.innerHTML = html;

    // remove espaços e quebras invisíveis
    const text = div.textContent?.replace(/\s/g, '') || '';
    return text.length;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {

        this.editor = Jodit.make(this.editorElement?.nativeElement, {
          height: 300,
          enter: 'p',
          disablePlugins: 'file image',
          toolbarSticky: false,
          // Toolbar simples (ideal pro Jasper)
          buttons: [
            'bold',
            'italic',
            'underline',
          ],
          askBeforePasteHTML: false,
          processPasteHTML: true,
          cleanHTML: {
            removeEmptyElements: true,   // remove <p><br></p>
            fillEmptyParagraph: false,
            replaceOldTags: {
              // define tags que são permitidas; as não listadas serão removidas
              b: 'b',
              strong: 'b',
              i: 'i',
              em: 'i',
              u: 'u',
              a: 'a',
              p: 'p',
              br: 'br'
            }
          }
        });

        this.editor.events.on(['paste'], (event: any) => {
          const html = event.clipboardData?.getData('text/html');

          if (html) {
            event.preventDefault();

            const limpo = this.normalizeHtml(html);
            this.editor?.selection.insertHTML(limpo);
          }
        })

        this.editor.events.on(['change'], () => this.updateFormControl());
        const textoParecer = this.parecerFormGroup.get('textoParecer');

        this.editor.value = textoParecer?.getRawValue();

        textoParecer?.valueChanges.subscribe(value => {
          if(this.editor)
            this.editor.value = value
        })


    })

  }

  normalizeHtml(html: string): string {
    const container = document.createElement('div');
    container.innerHTML = html;

    // Converte <li> em <p> com bullet
    container.querySelectorAll('li').forEach(li => {
      const p = document.createElement('p');
      p.textContent = '• ' + li.textContent?.trim();
      li.replaceWith(p);
    });

    // Remove as tags <ul> e <ol>
    container.querySelectorAll('ul, ol').forEach(el => {
      el.replaceWith(...Array.from(el.childNodes));
    });

    // Substitui <strong>/<em> por <b>/<i>
    container.querySelectorAll('strong').forEach(el => {
      const b = document.createElement('b');
      b.innerHTML = el.innerHTML;
      el.replaceWith(b);
    });

    container.querySelectorAll('em').forEach(el => {
      const i = document.createElement('i');
      i.innerHTML = el.innerHTML;
      el.replaceWith(i);
    });

    return container.innerHTML;
  }

  MAX_CHARS = 10000;

  updateFormControl() {
    if(!this.editor) return;
    const html = this.editor.value;

    // ignora conteúdo vazio/fantasma
    if (!html || html === '<p><br></p>') {
      this.textoLength = 0;
      this.parecerFormGroup.get('textoParecer')?.patchValue('', { emitEvent: false });
      return;
    }

    const plainText = this.getPlainText(html);

    // bloqueia se passar do limite
    if (plainText.length > this.MAX_CHARS) {
      // corta o texto
      const truncated = plainText.substring(0, this.MAX_CHARS);

      // atualizar editor com HTML mínimo
      this.editor.value = truncated;
      this.textoLength = this.MAX_CHARS;
      const scroll = this.editor.editor.scrollTop;
      this.parecerFormGroup.get('textoParecer')?.patchValue(this.normalizeHtml(truncated), { emitEvent: false });
      setTimeout(() => {
        if(!this.editor) return;
        this.editor.editor.scrollTop = this.editor.editor.scrollHeight;
      }, 0)

      return;
    }

    this.textoLength = plainText.length;
    this.parecerFormGroup.get('textoParecer')?.patchValue(this.normalizeHtml(html), { emitEvent: false });
  }

  // função auxiliar para extrair texto puro
  getPlainText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent?.trim() || '';
  }

}
