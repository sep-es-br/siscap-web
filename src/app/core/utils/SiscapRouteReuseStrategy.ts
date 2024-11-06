import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';

/*
	01/11/2024 - Artur Faria
	Tarefa: [SISCAP-262] - Navegação após pesquisa
	
	Descrição:
		Finalidade da tarefa é permitir ao usuário navegar para a mesma página ao clicar no 
		seu item do sub menu. Ex: 'Projetos'

		Propósito é permitir a "limpeza" do filtro de pesquisa em páginas de listagem de 
		dados.

	Problema:
		Configuração do módulo Router do Angular fornece propriedade 'onSameUrlNavigation'
		com dois possíveis valores: 'ignore' e 'reload'. Por padrão (sem nenhuma configuração 
		global do módulo Router), o valor é 'ignore'.

		Configuração de onSameUrlNavigation com valor 'reload' apenas notifica o Angular para 
		que, ao navegar para a mesma rota, o mesmo re-valide os Guards (permissionamento de 
		navegação para a rota e renderização do componente) e Resolvers (set e/ou get de 
		possíveis metadados da rota). Isso NÃO recarrega o componente, uma vez que, quando
		carregado, os dados do componente são mantidos á fim de evitar reprocessamentos
		desnecessários.

	Abordagem:
		Implementação customizada do provider RouteReuseStrategy na raiz da aplicação 
		(app.config.ts). Idéia é configurar apenas o método abstrato shouldReuseRoute
		retornando valor false; Isso força o Angular a recriar o componente mesmo ao 
		navegar para a mesma rota.

		Essa solução atende aos critérios de resolução da tarefa, porém é uma implementação
		crua e não refinada da classe RouteReuseStrategy. Métodos implementados devido á
		extensão de RouteReuseStrategy não são necessários para o escopo dessa tarefa,
		simplesmente retornando valores e sem implementação de lógica.

	Possíveis melhorias:
		- Entender melhor argumento ActivatedRouteSnapshot dentro dos métodos:
			Devido á lazy loading da aplicação, rotas fornecidas no argumento do tipo
			ActivatedRouteSnapshot dos métodos trazem informações de rotas em "cascata",
			ou seja, a primeira rota carregada traz a raiz da aplicação ('' ou '/'),
			seguida da rota do componente principal ('main') e por fim a rota atual.

			Análise inicial traz dados inconsistentes (geralmente vazios ou null), o que
			dificulta a maniupulação de dados para lógica de verificação dentro dos métodos.
			
		- Estudar demais métodos não utilizados:
			Guias na internet mencionam que utilização dos metodos shouldDetach, store,
			shouldAttach e retrieve oferecem mais rapidez e estabilidade no fluxo da jornada
			do usuário.
			
			Exemplo: Usuário preenche formulário de Projeto; porém token expira e o mesmo é 
			enviado para a tela de login para revalidação, perdendo todas as informações.

			Existem diversas possíveis alternativas para a solução desse problema:
				* Novo Interceptor para revalidação da token, utilizando um operador Rxjs 
				  (retry ou similar) para garantir persistência de dados sem perda de 
				  informações.
				
				* Resolução do problema na stack do back-end da aplicação (extensão do tempo
				  de invalidação do token, sistema de caching de informação, etc.)

				* Utilização de serviços para trâmite de dados fornecidos pelo usuário através
				  de Observables e ou até mesmo localStorage/sessionStorage, similar a um 
				  CacheService.

			Porém, dado a sofisticação da utilização de RouteReuseStrategy, acredito eu que 
			esta seja a melhor solução para essa abordagem. Infelizmente, a implementação 
			correta e com o mínimo possível de bugs/comportamentos anômalos requer um estudo 
			mais aprofundado, custando tempo e incutindo em possíveis atrasos.
			
			Novamente, não é o escopo dessa tarefa.
*/

@Injectable({ providedIn: 'root' })
export class SiscapRouteReuseStrategy extends RouteReuseStrategy {
  public shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  public store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null
  ): void {}

  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }

  public shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    current: ActivatedRouteSnapshot
  ): boolean {
    return false;
  }
}
