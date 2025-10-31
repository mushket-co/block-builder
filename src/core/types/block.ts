/**
 * Типы для работы с блоками
 */

import { TBlockId, TRenderRef } from './common';
import { IFormGenerationConfig } from './form';

// Базовые типы для свойств блоков
export type TBlockSettings = Record<string, any>;
export type TBlockProps = Record<string, any>;
export type TBlockStyle = Record<string, string | number>;

// Метаданные блока
export interface IBlockMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
  author?: string;
}

// Базовый интерфейс с общими свойствами блока
interface IBaseBlock {
  type: string;
  settings: TBlockSettings;
  props: TBlockProps;
  style?: TBlockStyle;
  render?: TRenderRef;
  visible?: boolean;
  locked?: boolean;
  formConfig?: IFormGenerationConfig;
}

// Базовый интерфейс для блоков с ID и метаданными (все блоки в системе имеют это)
interface IBaseBlockWithIdAndMetadata extends IBaseBlock {
  id: TBlockId;
  metadata?: IBlockMetadata;
}

// Интерфейсы для настроек и свойств блоков (обратная совместимость)
export interface IBlockSettings extends TBlockSettings {}
export interface IBlockProps extends TBlockProps {}
export interface IBlockStyle extends TBlockStyle {}

// Основной интерфейс блока (доменная модель)
export interface IBlock extends IBaseBlockWithIdAndMetadata {
  children?: IBlock[];
  parent?: TBlockId;
}

// DTO для передачи данных блока (без бизнес-логики)
export interface IBlockDto extends IBaseBlockWithIdAndMetadata {
  children?: string[]; // IDs дочерних блоков
  parent?: string;
  order?: number; // Порядок блока в списке
}

// DTO для создания блока (единственный случай без ID и метаданных)
export interface ICreateBlockDto extends IBaseBlock {
  parent?: string;
  order?: number; // Порядок блока в списке
  metadata?: IBlockMetadata;
}

// DTO для обновления блока
export interface IUpdateBlockDto {
  settings?: Partial<TBlockSettings>;
  props?: Partial<TBlockProps>;
  style?: Partial<TBlockStyle>;
  order?: number;
  render?: TRenderRef;
  visible?: boolean;
  locked?: boolean;
  formConfig?: IFormGenerationConfig;
}

// DTO для списка блоков
export interface IBlockListDto {
  blocks: IBlockDto[];
  total: number;
  page?: number;
  limit?: number;
}

// Типы для утилит
export type TBlock = IBlockDto;
// Дерево блоков для иерархического представления (дети как узлы)
export type TBlockWithChildren = Omit<IBlockDto, 'children'> & { children: TBlockWithChildren[] };
