import { AbstractControl, ValidationErrors } from '@angular/forms';

function digitVerification(digits: string, verifDigit: string): boolean {
  const digitsAsNumbers = digits.split('').map((d) => Number(d));

  const mappedDigits = digitsAsNumbers.map((d, i) => {
    return d * (digitsAsNumbers.length + 1 - i);
  });

  const digitsSum = mappedDigits.reduce((prev, curr) => {
    return prev + curr;
  });

  const digitsSumRest = digitsSum % 11;

  const digitCheck = digitsSumRest < 2 ? 0 : 11 - digitsSumRest;

  return Number(verifDigit) == digitCheck;
}

export function CPFValidator(
  control: AbstractControl<any, any>
): ValidationErrors | null {
  const cpf = control.value as string;

  if (!cpf) {
    return null;
  }

  if (cpf.length < 11) {
    return null;
  }

  if (cpf.split('').every((d) => d == cpf[0])) {
    return { cpf: true };
  }

  const digits = cpf.slice(0, 9);
  const firstVerifDigit = cpf.charAt(9);
  const secondVerifDigit = cpf.charAt(10);

  const firstDigitCheck = digitVerification(digits, firstVerifDigit);

  const secondDigitCheck = digitVerification(
    digits.concat(firstVerifDigit),
    secondVerifDigit
  );

  if (!firstDigitCheck || !secondDigitCheck) {
    return { cpf: true };
  }

  return null;
}
