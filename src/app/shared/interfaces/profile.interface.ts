export interface IProfile {
    token: string;
    nome: string;
    email: string;
    subNovo: string;
    imagemPerfil?: ArrayBuffer;
    permissoes: Array<string>;
}