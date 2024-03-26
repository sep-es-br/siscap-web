interface IToastComponentInfo {
  header: string;
  body: string;
}

type ToastErrorInfo = {
  [code: number]: IToastComponentInfo;
};

export const ToastErrorInfoMap: ToastErrorInfo = {
  401: {
    header: 'Erro 401 - Não Autorizado',
    body: 'A token de autenticação não é válida. O sistema será redirecionado para a página de login para tentar a autenticação novamente. Ao completar o processo, você retornará para a página que estava anteriormente.',
  },
  500: {
    header: 'Erro 500 - Erro Interno de Servidor',
    body: 'Houve um problema ao tentar processar a requisição. Por favor, contate a equipe técnica da aplicação.',
  },
};
