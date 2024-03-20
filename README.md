# SISCAP - Sistema de Captação de Recursos

## 1. Visão Geral
Projeto criado para gerenciar e manter projetos, programas e captação de recursos, entre outras obras do governo do Espírito Santo, além de gerar
relatórios e métricas de acompanhamento do(a)s mesmo(a)s.

## 1.1 Aplicação Front-End (siscap-web)
Portal para interação dos usuários com as diversas obras do governo. 

## 2. Especificações Técnicas

### Principal
| Bibliotecas | Versão |
------------------------
| Angular     | 17.1.2 |
| Node        | 20.11.0|
| npm         | 10.2.4 |

### Externas
| Bibliotecas                                         | Versão  |
-----------------------------------------------------------------
| [ng-select](https://github.com/ng-select/ng-select) | ^12.0.7 |
| [ngx-mask](https://github.com/JsDaddy/ngx-mask)     | ^17.0.4 |
| [Bootstrap](https://getbootstrap.com/)              | 5.3     |

## 2.1 Estrutura de Pastas
```bash
    src
    ├───app
    │   ├───components
    │   ├───pages
    │   ├───pipes
    │   └───shared
    │       ├───guards
    │       ├───helpers
    │       ├───interceptors
    │       ├───interfaces
    │       ├───services
    │       └───utils
    ├───assets
    │   ├───icons
    │   └───svg
    └───environments
```

## 2.2 Instalação do Projeto
Para instalar o projeto, navegue até a pasta raiz do projeto e digite no terminal:
```bash
npm i
```
ou
```bash
npm install
```

## 2.3 Inicialização do Projeto
Para iniciar o sistema em modo de desenvolvimento, navegue até a pasta raiz do projeto e digite no terminal:
```bash
ng s
```
ou
```bash
ng serve
```

[!NOTE]
Para iniciar o sistema em modo de **produção**, utilize o seguinte comando no terminal:
```bash
ng build
```

## 3. Licensa
A utilização e manutenção do código do SISCAP é _open source_ de acordo com a legislação da licensa [GPL-3.0](https://github.com/sep-es-br/siscap-web?tab=GPL-3.0-1-ov-file).