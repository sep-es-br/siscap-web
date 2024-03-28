import { IToastInfo } from '../services/toast/toast.service';

interface ToastErrorInfo {
  [code: number]: IToastInfo;
}

interface ToastSuccessInfo {
  [source: string]: {
    [method: string]: IToastInfo;
  };
}

export const ToastErrorInfoMap: ToastErrorInfo = {
  400: {
    type: 'error',
    header: 'Erro 400 - Requisição Inválida',
    body: 'O corpo da requisição possui erros. Por favor, contate a equipe técnica da aplicação',
  },
  401: {
    type: 'error',
    header: 'Erro 401 - Não Autorizado',
    body: 'O token de autenticação não é válido. O sistema será redirecionado para a página de login para tentar a autenticação novamente. Ao completar o processo, você retornará para a página que estava anteriormente.',
  },
  500: {
    type: 'error',
    header: 'Erro 500 - Erro Interno de Servidor',
    body: 'Houve um problema ao tentar processar a requisição. Por favor, contate a equipe técnica da aplicação.',
  },
};

export const ToastSuccessInfoMap: ToastSuccessInfo = {
  Projeto: {
    POST: {
      type: 'success',
      header: 'Sucesso',
      body: 'Projeto cadastrado com sucesso.',
    },
    PUT: {
      type: 'success',
      header: 'Sucesso',
      body: 'Projeto atualizado com sucesso.',
    },
    DELETE: {
      type: 'success',
      header: 'Sucesso',
      body: 'Projeto excluído com sucesso.',
    },
  },
  Pessoa: {
    POST: {
      type: 'success',
      header: 'Sucesso',
      body: 'Pessoa cadastrada com sucesso.',
    },
    PUT: {
      type: 'success',
      header: 'Sucesso',
      body: 'Pessoa atualizada com sucesso.',
    },
    DELETE: {
      type: 'success',
      header: 'Sucesso',
      body: 'Pessoa excluída com sucesso.',
    },
  },
  Organização: {
    POST: {
      type: 'success',
      header: 'Sucesso',
      body: 'Organização cadastrada com sucesso.',
    },
    PUT: {
      type: 'success',
      header: 'Sucesso',
      body: 'Organização atualizada com sucesso.',
    },
    DELETE: {
      type: 'success',
      header: 'Sucesso',
      body: 'Organização excluída com sucesso.',
    },
  },
};
