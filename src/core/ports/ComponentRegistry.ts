import { TComponent } from '../types';

export type { TComponent } from '../types';
export interface IComponentRegistry {
  register(name: string, component: TComponent): void;
  get(name: string): TComponent | null;
  has(name: string): boolean;
  getAll(): Record<string, TComponent>;
  unregister(name: string): boolean;
  clear(): void;
}
