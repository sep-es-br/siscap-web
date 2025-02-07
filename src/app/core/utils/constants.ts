/**
 * Arquivo contendo constantes reutilizadas em toda a aplicação
 */

/**
 * Lista de caminhos a serem ignorados na geração de breadcrumbs.
 *
 * Utilizado em `src/app/core/components/breadcrumb/breadcrumb.component.ts`
 */
export const BREADCRUMB_LISTA_CAMINHOS_EXCLUSAO: Array<string> = [
  '',
  'main',
  'login',
];

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
  'prospeccao',
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
  { caminho: 'visualizar', contexto: 'prospeccao' },
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

  prospeccao: 'Prospecção',
  prospeccaocriar: 'Nova Prospecção',
  prospeccaoeditar: 'Editar Prospecção',
  prospeccaovisualizar: 'Visualizar Prospecção', // Caso específico
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

/**
 * Objeto de coleção de mensagens de tooltip do formulário de projeto.
 *
 * Utilizado para alimentar propriedade de input `texto` de
 * um componente <form-helper-tooltip>.
 */
export const COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO: Record<string, string> =
  {
    sigla: 'Indicar o nome fantasia do projeto.',
    titulo:
      'Informar o nome do projeto. O nome deverá refletir o objetivo maior do projeto.',
    idOrganizacao:
      'Identifique a instituição (Secretaria de Estado, Autarquia, Órgão de outros poderes do Estado, etc.) que será o tomador dos recursos, gestor do projeto.',
    valorEstimado:
      'Indicar o valor total necessário para a execução do projeto proposto em R$.',
    idMicrorregioesList:
      '(i) Informar as instituições envolvidas na implementação do projeto e suas respectivas responsabilidades na execução. (ii) Informar a capacidade das insituições para a implementação das ações do projeto (equipe técnica, estrutura, experiência).',
    objetivo:
      'Deverá refletir o que se deseja alcançar com as ações do projeto.',
    objetivoEspecifico:
      'Deverão refletir as ações a serem implementadas no âmbito do projeto, tendo como referência os problemas identificados e as soluções propostas. Deverão corresponder aos resultados que o projeto pretende atingir, contribuindo para o alcance do objetivo geral. Também deverão ter vínculo com os Objetivos de Desenvolvimento Sustentável da ONU.',
    situacaoProblema:
      'Identificar o(s) problema(s) que as ações do projeto candidato a financiamento se propõem solucionar ou minorar. Descrever clara e sucintamente a situação-problema atual, apresentando informações e dados que a caracterizem e demonstrem o(s) problema(s). Trata-se da situação inicial que se deseja mudar.',
    solucoesPropostas:
      'Descrever as ações escolhidas para o enfrentamento ou solução do(s) problema(s) descrito(s) no item anterior.',
    impactos:
      'Informar (i) as medidas de sustentabilidade a serem adotadas e os custos adicionais estimados decorrentes da implementação do projeto, referentes aos gastos incrementais de pessoa, de operacionalização e de manutenção de obras e bens; (ii) os principais impactos ambientais decorrentes da implementação do projeto; (iii) possíveis interferências em populações decorrentes da implementação do projeto. Especificar se há interferência em populações indígenas, quilombolas e outras; (iv) os riscos e ações mitigadoras.',
    arranjosInstitucionais:
      '(i) Informar as instituições envolvidas na implementação do projeto e suas respectivas responsabilidades na execução. (ii) Informar a capacidade das instituições para a implementação das ações do projeto (equipe técnica, estrutura, experiência).',
    idResponsavelProponente: 'Pessoa que responde pelo órgão de origem.',
    equipeElaboracao: 'Pessoas responsáveis pela elaboração do projeto.',
  };
