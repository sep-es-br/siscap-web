import { Component } from '@angular/core';
import { PessoasService } from '../../core/services/pessoas/pessoas.service';

declare type ITeste = {
  ConjuntoPai: string;
};

@Component({
  selector: 'siscap-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(private _pessoasService: PessoasService) {}

  public botaoGrupos(): void {
    const cpf_eu = '14744812724';
    const cpf_marquinhos = '07461234773';
    const cpf_diego = '87063000225';
    const cpf_vagner = '';

    // this.resultado(cpf_eu);
    this.resultadoGrupos(cpf_marquinhos);
    // this.resultado(cpf_diego);
  }

  public botaoOrganogramaOrganizacoes(): void {
    // DADOS USANDO CPF MARQUINHOS
    const guid_a = 'd2ab305b-3f41-4802-b509-09f447ab3016';
    const guid_b = '6db334b7-05ea-49fe-a33a-bf0a19e96670';
    const guid_c = '07a0462f-6b02-4b98-b86d-18d7e4fa543a';
    const guid_d = 'fe88eb2a-a1f3-4cb1-a684-87317baf5a57';

    // this.resultadoOrganogramaOrganizacoes(guid_a); // ORGANIZACAO NÃO ENCONTRADA
    // this.resultadoOrganogramaOrganizacoes(guid_b); // RETORNOU ~ SEP ~
    // this.resultadoOrganogramaOrganizacoes(guid_c); // ORGANIZACAO NÃO ENCONTRADA
    // this.resultadoOrganogramaOrganizacoes(guid_d); // RETORNOU ~ GOVES ~
  }

  private resultadoGrupos(cpf_pessoa: string): void {
    this._pessoasService.testeGrupos(cpf_pessoa).subscribe((res) => {
      // console.log(res);

      const resMap = res.map((grupo: any) => {
        return { ConjuntoPai: grupo['ConjuntoPai'] };
      });

      // console.log(resMap);

      let resMapFilter: ITeste[] = [];

      resMap.forEach((grupo: ITeste) => {
        const check = resMapFilter.some(
          (item) => item.ConjuntoPai === grupo.ConjuntoPai
        );

        if (!check) resMapFilter.push(grupo);
      });

      // console.log(resMapFilter);

      const final = resMapFilter.map((item) => item.ConjuntoPai);

      console.log(final);
    });
  }

  private resultadoOrganogramaOrganizacoes(guid: string): void {
    this._pessoasService.testeOrganogramaOrganizacao(guid).subscribe((res) => {
      console.log(res);
    });
  }
}
