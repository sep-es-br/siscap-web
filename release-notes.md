# SISCAP
## Versão 1.1.0
### Feature de Programas

**Aplicação**
1. Estrutura de Pastas e Arquivos
   * Conteúdo da pasta `shared` movido para pasta `core` e vice-e-versa (Adequação aos padrões de boas práticas do Angular).
2. Refatoração dos componentes de apresentação
   * Componentes `HeaderComponent`, `NavMenuComponent` e `BreadcrumbComponent` foram refatorados para permitir melhor componentização e facilidade de manutenção/implementação de novas features.
   * Componente `UserProfileComponent` para facilitar lógica de exibição de dados e roteamento para edição do perfil do usuário (página Meu Perfil).
3. Navegação e Roteamento
   * Criação do link de navegação para Programas.

**Projetos**
1. Página de Listagem
   * Adicionada funcionalidade de pesquisa por sigla ou título do Projeto.

2. Página de Formulário
   * Funcionalidade de _Membros da Equipe_ substituída por componente _Equipe de Elaboração_.
     * Campo _Órgão Responsável_ se mantém.
     * Campo _Responsável Proponente_ busca Pessoa vinculada á Organização como responsável.
     * Componente de _Equipe de Elaboração_ aceita múltiplas Pessoas e atrela um Papel á elas.
   * Funcionalidade de _Valor Estimado_ substituída por componente _Valor_
     * Campo _Moeda_ permite seleção do tipo de unidade monetária.
       > `Não realiza conversão! Apenas muda o símbolo da moeda.`
     * Campo _Valor_ recebe o valor monetário (em espécie) do Projeto.
     * Campo _Tipo_ permite seleção do tipo de valor dentro do contexto do negócio.
       > `Por motivos de regra de negócio, tipo de valor de uma entidade Projeto somente pode ser Estimado.`
   * Funcionalidade de _Microrregiões Atendidas_ substituída por componente _Rateio_.
     * Permite a inclusão/exclusão de Microrregiões e suas respectivas Cidades no rateio.
     * Controle de valores percentual e monetário por Microrregião e/ou Cidade.
     * Lógica baseada no valor estimado do Projeto.

**Programas**
1. Página de Listagem
   * Adicionada página de listagem de Programas, sendo possível pesquisar por sigla ou título do Programa.

2. Página de Formulário
   * Adicionada página de formulário de cadastro e/ou atualização de Programa.
     * Campos _Sigla_ e _Título_ do Programa de texto livre.
     * Campo _Órgão Executor_ com seleção múltipla de Organizações.
     * Componente _Equipe de Captação_, permitindo inclusão de múltiplas de Pessoas com um Papel atrelado á elas.
     * Componente _Projetos Propostos_, vinculando Projetos válidos e ativos ao Programa.
     * Componente _Valor_, permitindo seleção de _Moeda_ e _Tipo_, além do preenchimento do _Valor_ do Programa (expresso em valor numérico).  

**Organizações**
1. Página de Listagem
   * Adicionada funcionalidade de pesquisa por nome ou abreviatura da Organização.
   
2. Página de Formulário
   * Campo _Responsável_ torna-se obrigatório ao preencher formulário de Organização.
     * Agora vincula a Pessoa selecionada como responsável da organização. 

**Pessoas**
1. Página de Listagem
   * Adicionada funcionalidade de pesquisa por nome, e-mail da Pessoa, ou nome ou abreviatura da(s) Organização(ões) pertencente(s) da Pessoa.
   
2. Página de Formulário
   * Campo _Organizações_ agora permite seleção de múltiplas Organizações.
     * Ao tentar remover Organização na qual a Pessoa é responsável, usuário é notificado sobre a ação.
   * Formulário de _Endereço_ sofre alterações de validação.
     * Caso nenhum campo seja preenchido, nenhum campo é obrigatório.
     * Caso ao menos um campo seja preenchido, TODOS os campos se tornam obrigatórios.  
