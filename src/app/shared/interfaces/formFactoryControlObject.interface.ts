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


// Potencial ideia para otimizar processo

// export interface IFormFactoryControl<U> {
//   // initialValue: string | number | Array<any> | null;
//   initialValue: U | null;
//   validators?: {
//     min?: number;
//     max?: number;
//     minLength?: number;
//     maxLength?: number;
//     required?: boolean;
//     requiredTrue?: boolean;
//     pattern?: string | RegExp;
//   };
// }

// export type FormFactoryControlObject<T> = {
//   [K in keyof T]: IFormFactoryControl<T[K]>
// } 
