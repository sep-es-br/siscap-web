interface IMenuRoute {
  title: string;
  path: string;
  hidden: boolean;
}

interface IMenuLink {
  category: string;
  hidden: boolean;
  routes: Array<IMenuRoute>;
}

export abstract class NavMenuLinks {
  static menuLinks: Array<IMenuLink> = [
    {
      category: 'Banco de Projetos',
      hidden: false,
      routes: [
        { title: 'Projetos', path: 'projetos', hidden: false },
        { title: 'Programas', path: 'programas', hidden: true },
      ],
    },
    {
      category: 'Captação de Recursos',
      hidden: true,
      routes: [
        { title: 'Prospecção', path: 'prospeccao', hidden: true },
        { title: 'Oportunidade', path: 'oportunidade', hidden: true },
        { title: 'Captação', path: 'captacao', hidden: true },
        { title: 'Contratos', path: 'contratos', hidden: true },
      ],
    },
    {
      category: 'Estatístico',
      hidden: true,
      routes: [
        { title: 'Relatórios', path: 'relatorios', hidden: true },
        { title: 'Business Intelligence', path: 'bi', hidden: true },
      ],
    },
    {
      category: 'Configurações',
      hidden: false,
      routes: [
        { title: 'Pessoas', path: 'pessoas', hidden: false },
        { title: 'Entidades', path: 'entidades', hidden: false },
        { title: 'Grupos de Usuários', path: 'usuarios', hidden: true },
      ],
    },
  ];
}
