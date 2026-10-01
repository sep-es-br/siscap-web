import { MENSAGENS } from '../utils/constants';
interface IMenuRoute {
  title: string;
  path: string;
  hidden: boolean;
}

export interface IMenuLink {
  category: string;
  hidden: boolean;
  slug: string;
  routes: Array<IMenuRoute>;
}

export abstract class MenuLinksHelper {
  public static readonly menuLinks: Array<IMenuLink> = [
    {
      category: MENSAGENS.DASHBOARD,
      hidden: false,
      slug: 'dashboard',
      routes: [{ title: MENSAGENS.DASHBOARD, path: 'home', hidden: false }],
    },
    {
      category: MENSAGENS.BANCO_DE_PROJETOS,
      hidden: false,
      slug: 'banco_projeto',
      routes: [
        { title: MENSAGENS.PROJETOS, path: 'projetos', hidden: false },
        { title: MENSAGENS.PROGRAMAS, path: 'programas', hidden: false },
      ],
    },
    {
      category: MENSAGENS.CAPTACAO_DE_RECURSOS,
      hidden: false,
      slug: 'captacao_recursos',
      routes: [
        { title: MENSAGENS.PESQUISA_DE_FONTES_DE_FINANCIAMENTO, path: 'cartasconsulta', hidden: false },
        { title: MENSAGENS.PROSPECCAO, path: 'prospeccao', hidden: false },
        { title: MENSAGENS.OPORTUNIDADE, path: 'oportunidade', hidden: true },
        { title: MENSAGENS.CAPTACAO, path: 'captacao', hidden: true },
        { title: MENSAGENS.CONTRATOS, path: 'contratos', hidden: true },
      ],
    },
    {
      category: MENSAGENS.ESTATISTICO,
      hidden: true,
      slug: 'estatistico',
      routes: [
        { title: MENSAGENS.RELATORIOS, path: 'relatorios', hidden: true },
        { title: MENSAGENS.BUSINESS_INTELLIGENCE, path: 'bi', hidden: true },
      ],
    },
    {
      category: MENSAGENS.PARTES_INTERESSADAS,
      hidden: false,
      slug: 'configuracoes',
      routes: [
        { title: MENSAGENS.ORGANIZACOES, path: 'organizacoes', hidden: false },
        { title: MENSAGENS.PESSOAS, path: 'pessoas', hidden: false },
        { title: MENSAGENS.GRUPOS_DE_USUARIOS, path: 'usuarios', hidden: true },
      ],
    },
  ];
}
