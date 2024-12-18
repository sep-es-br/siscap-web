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
      category: 'Dashboard',
      hidden: false,
      slug: 'dashboard',
      routes: [{ title: 'Dashboard', path: 'home', hidden: false }],
    },
    {
      category: 'Banco de Projetos',
      hidden: false,
      slug: 'banco_projeto',
      routes: [
        { title: 'Projetos', path: 'projetos', hidden: false },
        { title: 'Programas', path: 'programas', hidden: false },
      ],
    },
    {
      category: 'Captação de Recursos',
      hidden: false,
      slug: 'captacao_recursos',
      routes: [
        { title: 'Cartas Consulta', path: 'cartasconsulta', hidden: false },
        { title: 'Prospecção', path: 'prospeccao', hidden: false },
        { title: 'Oportunidade', path: 'oportunidade', hidden: true },
        { title: 'Captação', path: 'captacao', hidden: true },
        { title: 'Contratos', path: 'contratos', hidden: true },
      ],
    },
    {
      category: 'Estatístico',
      hidden: true,
      slug: 'estatistico',
      routes: [
        { title: 'Relatórios', path: 'relatorios', hidden: true },
        { title: 'Business Intelligence', path: 'bi', hidden: true },
      ],
    },
    {
      category: 'Partes Interessadas',
      hidden: false,
      slug: 'configuracoes',
      routes: [
        { title: 'Organizações', path: 'organizacoes', hidden: false },
        { title: 'Pessoas', path: 'pessoas', hidden: false },
        { title: 'Grupos de Usuários', path: 'usuarios', hidden: true },
      ],
    },
  ];
}
