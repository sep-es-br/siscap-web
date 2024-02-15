export interface IFormFactoryControlObject {
  initialValue: string | number | Array<any> | null;
  validators?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    requiredTrue?: boolean;
    pattern?: string | RegExp;
  };
}
