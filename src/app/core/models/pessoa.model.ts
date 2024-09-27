import {
  IEndereco,
  IPessoa,
  IPessoaForm,
} from '../interfaces/pessoa.interface';

export class EnderecoModel implements IEndereco {
  public rua: string;
  public numero: string;
  public bairro: string;
  public complemento: string;
  public codigoPostal: string;
  public idCidade: number;
  public idEstado: number;
  public idPais: number;

  constructor(endereco?: IEndereco) {
    this.rua = endereco?.rua ?? '';
    this.numero = endereco?.numero ?? '';
    this.bairro = endereco?.bairro ?? '';
    this.complemento = endereco?.complemento ?? '';
    this.codigoPostal = endereco?.codigoPostal ?? '';
    this.idCidade = endereco?.idCidade ?? 0;
    this.idEstado = endereco?.idEstado ?? 0;
    this.idPais = endereco?.idPais ?? 0;
  }
}

export class PessoaFormModel implements IPessoaForm {
  public sub?: string;
  public nome: string;
  public nomeSocial: string;
  public nacionalidade: string;
  public genero: string;
  public cpf: string;
  public email: string;
  public telefoneComercial: string;
  public telefonePessoal: string;
  public endereco: EnderecoModel;
  public idOrganizacoes: Array<number>;
  public idOrganizacaoResponsavel: number | null;
  public idAreasAtuacao: Array<number>;

  constructor(pessoaForm?: IPessoaForm) {
    if (pessoaForm?.sub) {
      this.sub = pessoaForm?.sub;
    }

    this.nome = pessoaForm?.nome ?? '';
    this.nomeSocial = pessoaForm?.nomeSocial ?? '';
    this.nacionalidade = pessoaForm?.nacionalidade ?? '';
    this.genero = pessoaForm?.genero ?? '';
    this.cpf = pessoaForm?.cpf ?? '';
    this.email = pessoaForm?.email ?? '';
    this.telefoneComercial = pessoaForm?.telefoneComercial ?? '';
    this.telefonePessoal = pessoaForm?.telefonePessoal ?? '';
    this.endereco = new EnderecoModel(pessoaForm?.endereco);
    this.idOrganizacoes = pessoaForm?.idOrganizacoes ?? [];
    this.idOrganizacaoResponsavel =
      pessoaForm?.idOrganizacaoResponsavel ?? null;
    this.idAreasAtuacao = pessoaForm?.idAreasAtuacao ?? [];
  }
}

export class PessoaModel extends PessoaFormModel implements IPessoa {
  public readonly id: number;
  public imagemPerfil: ArrayBuffer | null;

  constructor(pessoa?: IPessoa) {
    super(pessoa);
    this.id = pessoa?.id ?? 0;
    this.imagemPerfil = pessoa?.imagemPerfil ?? null;
  }
}
