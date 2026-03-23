
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
export class ProjetoParecerComponent {

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
    const subeoSubeppEntranhados = this.pareceresProjeto.length > 0 &&
      this.pareceresProjeto
        .filter(p =>
          [LotacaoUsuarioEnum.SUBEO, LotacaoUsuarioEnum.SUBEPP].includes(p.parecerLotacao)
        )
        .every(p => p.statusParecer === StatusParecerEnum.Entranhado_Processo_Edocs);
    return this.statusProjeto === StatusProjetoEnum.Parecer_SEP && subeoSubeppEntranhados && (this.lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP);
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

    console.log(' this.isSubeep - ', this.isSubepp() )
    console.log(' this.lotacaoUsuario - ', this.lotacaoUsuario )

  }

<<<<<<< Updated upstream
=======
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
            '|',
            'ul',
            'ol',
          ],
          cleanHTML: {
            removeEmptyElements: true,   // remove <p><br></p>
            fillEmptyParagraph: false,
            replaceOldTags: {
              // define tags que são permitidas; as não listadas serão removidas
              b: 'b',
              strong: 'strong',
              i: 'i',
              em: 'em',
              u: 'u',
              ul: 'ul',
              ol: 'ol',
              li: 'li',
              a: 'a',
              p: 'p',
              br: 'br'
            }
          }
        });

        this.editor.events.on(['change'], () => this.updateFormControl());


    })
    
  }

  MAX_CHARS = 2000;

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
      this.parecerFormGroup.get('textoParecer')?.patchValue(truncated, { emitEvent: false });
      setTimeout(() => {
        if(!this.editor) return;
        this.editor.editor.scrollTop = this.editor.editor.scrollHeight;
      })
      
      return;
    }

    this.textoLength = plainText.length;
    this.parecerFormGroup.get('textoParecer')?.patchValue(html, { emitEvent: false });
  }

  // função auxiliar para extrair texto puro
  getPlainText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent?.trim() || '';
  }

>>>>>>> Stashed changes
}
