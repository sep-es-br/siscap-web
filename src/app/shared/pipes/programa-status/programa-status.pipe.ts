import { Pipe, PipeTransform } from "@angular/core"
import { StatusPrograma, StatusProgramaLabel } from "../../../core/interfaces/programa.interface";

@Pipe({
  name: 'nomeStatusPrograma',
  standalone: true,
})
export class NomeStatusProgramaPipe implements PipeTransform {
  transform(status: StatusPrograma): string {
    if (status) {
      return StatusProgramaLabel[status];
    }

    return '--';
  }
}