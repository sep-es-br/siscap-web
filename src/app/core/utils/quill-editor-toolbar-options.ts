import { QuillToolbarConfig } from 'ngx-quill';

/**
 * Constante de configuração da barra de ferramentas do editor de texto Quill.js (elemento `<quill-editor>`).
 *
 * Ordem dos elementos no array é a ordem que os botões são exibidos na barra.
 *
 * `size` - Dropdown com opções de tamanho de fonte.
 *
 * `header` - Dropdown com opções de tamanho de cabeçalho.
 *
 * `bold, italic, underline, strike` - Botões de formatação de texto (negrito, itálico, sublinhado e riscado).
 *
 * `list` - Botões de inserção de listas (ordenada, não ordenada/pontuada).
 *
 * `align` - Dropdown com opções de alinhamento de texto. Array vazio traz valores padrão da biblioteca Quill.js.
 *
 * `color, background` - Dropdown com seleção de cores da fonte e fundo do texto. Array vazio traz valores padrão da biblioteca Quill.js.
 *
 * `link, image, video` - Botões de inserção de hiperlink, imagem e video.
 *
 * `clean` - Botão de limpeza de formatação.
 */
export const quillEditorToolbarOptions: QuillToolbarConfig = [
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  [{ color: [] }, { background: [] }],
  ['link', 'image', 'video'],
  ['clean'],
];
