import { MENSAGENS, formatarMensagem } from '../../../core/utils/constants';

import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { IParecer, IParecerAnexo } from '../../../core/interfaces/parecer.interface';
import { ParecerService } from '../../../core/services/parecer/parecer.service';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { LotacaoUsuarioEnum } from '../../../core/enums/lotacao-usuario.enum';
import { StatusParecerEnum } from '../../../core/enums/status-parecer.enum';
import { Jodit } from 'jodit';
import { ToastService } from '../../../core/services/toast/toast.service';
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
export class ProjetoParecerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  public readonly MENSAGENS = MENSAGENS;
  public readonly formatarMensagem = formatarMensagem;


  @ViewChild('editor') editorElement!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('pdfInput') pdfInput!: ElementRef<HTMLInputElement>;

  editor!: Jodit | undefined;
  private editorInitTimer?: ReturnType<typeof setTimeout>;
  private textoParecerSubscription?: Subscription;
  private atualizandoEditor = false;
  private ultimoHtmlProcessado?: string;

  textoLength = 0;

  @Input() projetoForm!: FormGroup;
  @Input() statusProjeto!: string;
  @Input() lotacaoUsuario!: number;
  @Input() pareceresProjeto!: IParecer[];

  @Output() arquivoParecerChange = new EventEmitter<File | null>();

  public anexoPdfSelecionado?: IParecerAnexo;

  constructor(
    private fb: FormBuilder,
    private readonly _toastService: ToastService,
    private readonly zone: NgZone,
    private _projetoParecerService: ParecerService
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
    return !(statusParecer === StatusParecerEnum.Pendente);
  }

  ngOnInit(): void {

    const textoParecer = this.parecerFormGroup.get('textoParecer');

    if (this.statusProjeto == StatusProjetoEnum.Parecer_SEP || this.statusProjeto == StatusProjetoEnum.Elegivel) {
      textoParecer?.setValidators([Validators.required]);
    } else {
      textoParecer?.clearValidators();
    }

    textoParecer?.updateValueAndValidity();

    const nomeArquivo = this.parecerFormGroup.get('nomeArquivo')?.value;
    
    this.anexoPdfSelecionado = {
      nomeArquivo: nomeArquivo,
      tamanhoBytes: 0,
      tamanhoFormatado: '',
      tipoMime: 'application/pdf'
    };

    

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
    this.zone.runOutsideAngular(() => {
    this.editorInitTimer = setTimeout(() => {
      if (!this.editorElement?.nativeElement) return;

      this.editor = Jodit.make(this.editorElement?.nativeElement, {
        height: 300,
        showPlaceholder: false,
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
          this.zone.run(() => this.updateFormControl(true));
        }
      })

      const textoParecer = this.parecerFormGroup.get('textoParecer');

      this.editor.value = textoParecer?.getRawValue() ?? '';
      this.editor.editor.setAttribute('data-parecer-placeholder', MENSAGENS.DIGITE_AQUI_O_TEXTO_DO_PARECER);
      this.editor.editor.setAttribute('aria-placeholder', MENSAGENS.DIGITE_AQUI_O_TEXTO_DO_PARECER);
      this.atualizarPlaceholderEditor();
      this.editor.events.on(this.editor.editor, 'input', () => {
        if (!this.atualizandoEditor) this.zone.run(() => this.updateFormControl(true));
      });
      this.editor.events.on(this.editor.editor, 'blur', () => {
        this.zone.run(() => {
          this.updateFormControl();
          this.parecerFormGroup.get('textoParecer')?.markAsTouched();
        });
      });
      this.zone.run(() => this.updateFormControl());
      this.editor.events.on(['change'], () => {
        if (!this.atualizandoEditor && this.editor?.value !== this.ultimoHtmlProcessado) {
          this.zone.run(() => this.updateFormControl());
        }
      });

      this.zone.run(() => this.vincularEditorAoFormulario());


    });
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editor && (changes['projetoForm'] || changes['statusProjeto'])) {
      this.vincularEditorAoFormulario();
    }
  }

  private vincularEditorAoFormulario(): void {
    this.textoParecerSubscription?.unsubscribe();
    const controle = this.parecerFormGroup.get('textoParecer');
    const atualizar = (value: string | null) => {
      if (!this.editor) return;
      this.atualizandoEditor = true;
      try {
        const html = value ?? '';
        this.zone.runOutsideAngular(() => {
          if (this.editor!.value !== html) this.editor!.value = html;
          const bloqueado = this.isEnviado() || !!this.parecerFormGroup.get('nomeArquivo')?.value;
          this.editor!.setReadOnly(bloqueado);
          this.editor!.setDisabled(bloqueado);
        });
        this.ultimoHtmlProcessado = this.editor.value;
        this.textoLength = this.getPlainText(this.editor.value).length;
        this.atualizarPlaceholderEditor();
      } finally {
        this.atualizandoEditor = false;
      }
    };
    atualizar(controle?.getRawValue());
    this.textoParecerSubscription = controle?.valueChanges.subscribe(atualizar);
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

  updateFormControl(alteradoPeloUsuario = false) {

    if (!this.editor) return;
    this.atualizarPlaceholderEditor();
    const controle = this.parecerFormGroup.get('textoParecer');
    if (alteradoPeloUsuario) controle?.markAsDirty();

    const html = this.editor.value;
    if (html === this.ultimoHtmlProcessado && !alteradoPeloUsuario) return;
    this.ultimoHtmlProcessado = html;

    // ignora conteúdo vazio/fantasma
    if (!this.getPlainText(html).replace(/[\s\u200B\uFEFF]/g, '')) {
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
      this.atualizandoEditor = true;
      try {
        this.editor.value = truncated;
        this.ultimoHtmlProcessado = this.editor.value;
      } finally {
        this.atualizandoEditor = false;
      }
      this.textoLength = this.MAX_CHARS;
      const scroll = this.editor.editor.scrollTop;
      this.parecerFormGroup.get('textoParecer')?.patchValue(this.normalizeHtml(truncated), { emitEvent: false });
      setTimeout(() => {
        if (!this.editor) return;
        this.editor.editor.scrollTop = this.editor.editor.scrollHeight;
      }, 0)

      return;
    }

    this.textoLength = plainText.length;

    this.parecerFormGroup.get('textoParecer')?.patchValue(this.normalizeHtml(html), { emitEvent: false });

  }

  private atualizarPlaceholderEditor(): void {
    if (!this.editor) return;
    const texto = this.editor.editor.textContent?.replace(/[\s\u200B\uFEFF]/g, '') ?? '';
    this.editor.editor.setAttribute('data-parecer-vazio', String(texto.length === 0 && !this.isEnviado()));
  }

  // função auxiliar para extrair texto puro
  ngOnDestroy(): void {
    clearTimeout(this.editorInitTimer);
    this.textoParecerSubscription?.unsubscribe();
    this.editor?.destruct();
    this.editor = undefined;
  }

  getPlainText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent?.trim() || '';
  }

  public selecionarPdf(): void {
    this.pdfInput.nativeElement.click();
  }

  public async onPdfSelecionado(event: Event): Promise<void> {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivo = input.files[0];

    const pdfValido = await this.validarPdf(arquivo);

    if (!pdfValido) {
      this._toastService.showToast(
        'error',
        MENSAGENS.O_ARQUIVO_SELECIONADO_NAO_E_UM_PDF_VALIDO,
      );
      input.value = '';
      return;
    }

    // arquivo emite para armazenar no componente pai..
    this.arquivoParecerChange.emit(arquivo);

    this.anexoPdfSelecionado = {
      nomeArquivo: arquivo.name,
      tamanhoBytes: arquivo.size,
      tamanhoFormatado: this.formatarTamanhoArquivo(arquivo.size),
      tipoMime: arquivo.type || 'application/pdf'
    };

    const textoMetadados = this.montarTextoMetadadosPdf(this.anexoPdfSelecionado);

    this.parecerFormGroup.get('textoParecer')?.setValue(textoMetadados);
    this.parecerFormGroup.get('nomeArquivo')?.setValue(arquivo.name); 
    
    this.textoLength = textoMetadados.length;

    input.value = ''

    if (this.editor) {
      this.editor.setReadOnly(true);
      this.editor.setDisabled(true);
    }

  }

  public possuiAnexo(): boolean {
    return !!this.parecerFormGroup.get('nomeArquivo')?.value;
  }

  public async validarPdf(arquivo: File): Promise<boolean> {

    const buffer = await arquivo.slice(0, 5).arrayBuffer();

    const bytes = new Uint8Array(buffer);

    const assinatura =
      String.fromCharCode(...bytes);

    return assinatura === '%PDF-';

  }

  private montarTextoMetadadosPdf(anexo: IParecerAnexo): string {
    return [
      MENSAGENS.PARECER_ANEXADO_EM_PDF,
      '',
      `Arquivo: ${anexo.nomeArquivo}`,
      `Tamanho: ${anexo.tamanhoFormatado}`,
      `Tipo: ${anexo.tipoMime}`
    ].join('\n');
  }

  private formatarTamanhoArquivo(tamanhoBytes: number): string {

    if (tamanhoBytes < 1024) {
      return formatarMensagem(MENSAGENS.PARAMETRO_BYTES, { p0: tamanhoBytes });
    }

    const tamanhoKb = tamanhoBytes / 1024;

    if (tamanhoKb < 1024) {
      return formatarMensagem(MENSAGENS.PARAMETRO_KB, { p0: tamanhoKb.toFixed(2) });
    }

    const tamanhoMb = tamanhoKb / 1024;

    return formatarMensagem(MENSAGENS.PARAMETRO_MB, { p0: tamanhoMb.toFixed(2) });

  }

  public baixarPdfAnexo(): void {

    const idParecer = this.parecerFormGroup.get('id')?.value;

    this._projetoParecerService.baixarParecer(idParecer);

  }

  public excluirPdfAnexo(): void {

    this.anexoPdfSelecionado = undefined;
    this.parecerFormGroup.get('nomeArquivo')?.setValue('');
    this.parecerFormGroup.get('nomeOriginalArquivo')?.setValue('');

    if (this.editor) {
      this.editor.value = '';
      this.editor.setReadOnly(false);
      this.editor.setDisabled(false);
    }

    const idParecer = this.parecerFormGroup.get('id')?.value;

    if (!idParecer) {
      return;
    }

    this._projetoParecerService.excluirAnexoParecer(idParecer).subscribe({
      next: () => console.log('OK'),
      error: err => console.error(err)
    });

  }

}
