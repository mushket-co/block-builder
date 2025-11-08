export type TValidationRuleType =
  | 'required'
  | 'email'
  | 'url'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom';
export interface IBaseValidationRule {
  type: TValidationRuleType;
  message?: string;
  field: string;
}
export interface IRequiredRule extends IBaseValidationRule {
  type: 'required';
}
export interface IEmailRule extends IBaseValidationRule {
  type: 'email';
}
export interface IUrlRule extends IBaseValidationRule {
  type: 'url';
}
export interface IMinRule extends IBaseValidationRule {
  type: 'min';
  value: number;
}
export interface IMaxRule extends IBaseValidationRule {
  type: 'max';
  value: number;
}
export interface IMinLengthRule extends IBaseValidationRule {
  type: 'minLength';
  value: number;
}
export interface IMaxLengthRule extends IBaseValidationRule {
  type: 'maxLength';
  value: number;
}
export interface IPatternRule extends IBaseValidationRule {
  type: 'pattern';
  value: RegExp;
}
export interface ICustomRule extends IBaseValidationRule {
  type: 'custom';
  validator: (value: any) => boolean | Promise<boolean>;
}
export type TValidationRule =
  | IRequiredRule
  | IEmailRule
  | IUrlRule
  | IMinRule
  | IMaxRule
  | IMinLengthRule
  | IMaxLengthRule
  | IPatternRule
  | ICustomRule;
export interface IValidationRule {
  type: TValidationRuleType;
  field: string;
  value?: any;
  message?: string;
  validator?: (value: any) => boolean;
}
export interface IValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}