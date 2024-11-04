/**
 * Arquivo contendo constantes reutilizadas em toda a aplicação
 */

/**
 * Lista de caminhos a serem ignorados na geração de breadcrumbs.
 *
 * Utilizado em `src/app/core/components/breadcrumb/breadcrumb.component.ts`
 */
export const BREADCRUMB_LISTA_CAMINHOS_EXCLUSAO: Array<string> = ['', 'main'];

/**
 * Lista de caminhos "principais" da aplicação.
 *
 * Utilizado em `src/app/core/components/breadcrumb/breadcrumb.component.ts`
 */
export const BREADCRUMB_LISTA_CAMINHOS_PRINCIPAIS: Array<string> = [
  'home',
  'projetos',
  'programas',
  'pessoas',
  'organizacoes',
  'cartasconsulta',
];

export const BREADCRUMB_LISTA_CAMINHOS_FILHOS: Array<string> = [
  'criar',
  'editar',
];

export const BREADCRUMB_LISTA_CAMINHOS_ESPECIFICOS: Array<{
  caminho: string;
  contexto: string;
}> = [
  { caminho: 'meu-perfil', contexto: 'pessoas' },
  { caminho: 'visualizar', contexto: 'cartasconsulta' },
];

export const BREADCRUMB_COLECAO_CAMINHO_TITULO: Record<string, string> = {
  home: 'Página Principal',

  projetos: 'Projetos',
  projetoscriar: 'Novo Projeto',
  projetoseditar: 'Editar Projeto',

  pessoas: 'Pessoas',
  pessoascriar: 'Nova Pessoa',
  pessoaseditar: 'Editar Pessoa',
  pessoasmeuperfil: 'Meu Perfil', // Caso específico

  organizacoes: 'Organizações',
  organizacoescriar: 'Nova Organização',
  organizacoeseditar: 'Editar Organização',

  programas: 'Programas',
  programascriar: 'Novo Programa',
  programaseditar: 'Editar Programa',

  cartasconsulta: 'Cartas Consulta',
  cartasconsultacriar: 'Nova Carta Consulta',
  cartasconsultaeditar: 'Editar Carta Consulta',
  cartasconsultavisualizar: 'Visualizar Carta Consulta', // Caso específico
};

/**
 * Lista de nacionalidades, com o propósito de alimentar opções
 * de um elemento HTML `<select>` ou similar.
 *
 * Utilizado no componente de formulário de pessoas (`PessoaFormComponent`).
 */
export const LISTA_NACIONALIDADES: Array<string> = [
  'Antiguano',
  'Argentino',
  'Bahamense',
  'Barbadiano, barbadense',
  'Belizenho',
  'Boliviano',
  'Brasileiro',
  'Chileno',
  'Colombiano',
  'Costarriquenho',
  'Cubano',
  'Dominicano',
  'Equatoriano',
  'Salvadorenho',
  'Granadino',
  'Guatemalteco',
  'Guianês',
  'Guianense',
  'Haitiano',
  'Hondurenho',
  'Jamaicano',
  'Mexicano',
  'Nicaraguense',
  'Panamenho',
  'Paraguaio',
  'Peruano',
  'Portorriquenho',
  'Dominicana',
  'São-cristovense',
  'São-vicentino',
  'Santa-lucense',
  'Surinamês',
  'Trindadense',
  'Uruguaio',
  'Venezuelano',
  'Alemão',
  'Austríaco',
  'Belga',
  'Croata',
  'Dinamarquês',
  'Eslovaco',
  'Esloveno',
  'Espanhol',
  'Francês',
  'Grego',
  'Húngaro',
  'Irlandês',
  'Italiano',
  'Noruego',
  'Holandês',
  'Polonês',
  'Português',
  'Britânico',
  'Inglês',
  'Galês',
  'Escocês',
  'Romeno',
  'Russo',
  'Sérvio',
  'Sueco',
  'Suíço',
  'Turco',
  'Ucraniano',
  'Americano',
  'Canadense',
  'Angolano',
  'Moçambicano',
  'Sul-africano',
  'Zimbabuense',
  'Argélia',
  'Comorense',
  'Egípcio',
  'Líbio',
  'Marroquino',
  'Ganés',
  'Queniano',
  'Ruandês',
  'Ugandense',
  'Bechuano',
  'Marfinense',
  'Camaronense',
  'Nigeriano',
  'Somali',
  'Australiano',
  'Neozelandês',
  'Afegão',
  'Saudita',
  'Armeno',
  'Bangladesh',
  'Chinês',
  'Norte-coreano, coreano',
  'Sul-coreano, coreano',
  'Indiano',
  'Indonésio',
  'Iraquiano',
  'Iraniano',
  'Israelita',
  'Japonês',
  'Malaio',
  'Nepalês',
  'Omanense',
  'Paquistanês',
  'Palestino',
  'Qatarense',
  'Sírio',
  'Cingalês',
  'Tailandês',
  'Timorense, maubere',
  'Árabe, emiratense',
  'Vietnamita',
  'Iemenita',
];

/**
 * Lista de gêneros, com o propósito de alimentar opções
 * de um elemento HTML `<select>` ou similar.
 *
 * Utilizado no componente de formulário de pessoas (`PessoaFormComponent`).
 */
export const LISTA_GENEROS: Array<string> = ['Masculino', 'Feminino', 'Outro'];

/**
 * Tempo de espera (em milisegundos) de ociosidade por parte do usuário
 * para começar a emitir eventos.
 *
 * Utilizado primariamente em funções de espera como `setTimeout`
 * e operadores Rxjs `debounceTime` , `auditTime`, `throttleTime`, etc.
 */
export const TEMPO_INPUT_USUARIO: number = 750;

/**
 * Tempo de espera (em milisegundos) para recálculo de valores.
 * Dependente de `TEMPO_INPUT_USUARIO` a fim de evitar conflito
 * entre dados novos (após o input do usuário) e antigos.
 */
export const TEMPO_RECALCULO: number = TEMPO_INPUT_USUARIO + 50;

const ERRO_MENSAGEM_REQUIRED: string = 'Campo obrigatório';
const ERRO_MENSAGEM_EMAIL: string = 'Email inválido';
const ERRO_MENSAGEM_MAXLENGTH: string = 'Tamanho acima do limite';
const ERRO_MENSAGEM_MINLENGTH: string = 'Tamanho abaixo do limite';
const ERRO_MENSAGEM_MAX: string = 'Valor superior ao limite';
const ERRO_MENSAGEM_MIN: string = 'Valor inferior ao limite';
const ERRO_MENSAGEM_CPF: string = 'CPF inválido';
const ERRO_MENSAGEM_MEMBRO_EQUIPE_SEM_PAPEL: string =
  'Algum membro da equipe não possui um papel atribuído';
const ERRO_MENSAGEM_LIMITE_RATEIO: string =
  'Alguns valores ultrapassam o limite do valor total fornecido.';

/**
 * Objeto de coleção de mensagens padrão de erro para validações de formulários.
 *
 * Utilizado em src/app/core/templates/validation-message/validation-message.component.ts
 */
export const COLECAO_ERRO_MENSAGEM: Record<string, string> = {
  required: ERRO_MENSAGEM_REQUIRED,
  email: ERRO_MENSAGEM_EMAIL,
  maxlength: ERRO_MENSAGEM_MAXLENGTH,
  minlength: ERRO_MENSAGEM_MINLENGTH,
  max: ERRO_MENSAGEM_MAX,
  min: ERRO_MENSAGEM_MIN,
  cpf: ERRO_MENSAGEM_CPF,
  membroEquipeSemPapel: ERRO_MENSAGEM_MEMBRO_EQUIPE_SEM_PAPEL,
  limiteRateio: ERRO_MENSAGEM_LIMITE_RATEIO,
};
