import type { TBlockId } from './common';

/**
 * Lifecycle-хуки модалки редактирования блока.
 *
 * **Scope:** UI-слой Vue и React (`BlockBuilder`, Nuxt/Next через те же компоненты).
 */
export interface IBlockFormOpenContext {
  mode: 'create' | 'edit';
  blockId?: TBlockId;
  /** block.props при edit; `{}` при create */
  props: Record<string, unknown>;
  /** Текущее состояние модалки (mutating через setField) */
  formData: Record<string, unknown>;
  setField: (name: string, value: unknown) => void;
}

export interface IBlockFormSaveContext {
  mode: 'create' | 'edit';
  blockId?: TBlockId;
  /** Уже прошёл validateForm */
  formData: Record<string, unknown>;
}

export interface IBlockFormSaveResult {
  /** Финальные props для записи в block.props */
  props: Record<string, unknown>;
  /** true — не сохранять, модалка остаётся открытой */
  cancel?: boolean;
}

export interface IBlockFormHooks {
  /** После заполнения formData defaults/props, до интерактива модалки (loader isFormHydrating) */
  onFormOpen?: (ctx: IBlockFormOpenContext) => Promise<void> | void;
  /** После validateForm, до createBlock/updateBlock — side-effect (API) + финальные props */
  onBeforeSave?: (ctx: IBlockFormSaveContext) => Promise<IBlockFormSaveResult | void> | IBlockFormSaveResult | void;
}

/** Конфиг типа блока с опциональными formHooks (Vue/React BlockBuilder) */
export interface IBlockTypeConfig {
  type: string;
  label: string;
  title?: string;
  icon?: string;
  render?: unknown;
  defaultSettings?: Record<string, unknown>;
  defaultProps?: Record<string, unknown>;
  fields?: unknown[];
  formHooks?: IBlockFormHooks;
  spacingOptions?: unknown;
  [key: string]: unknown;
}
