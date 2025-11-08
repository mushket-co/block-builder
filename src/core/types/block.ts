import { TBlockId, TRenderRef } from './common';
import { IFormGenerationConfig } from './form';
export type TBlockSettings = Record<string, any>;
export type TBlockProps = Record<string, any>;
export type TBlockStyle = Record<string, string | number>;
export interface IBlockMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
  author?: string;
}
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
interface IBaseBlockWithIdAndMetadata extends IBaseBlock {
  id: TBlockId;
  metadata?: IBlockMetadata;
}
export interface IBlockSettings extends TBlockSettings {}
export interface IBlockProps extends TBlockProps {}
export interface IBlockStyle extends TBlockStyle {}
export interface IBlock extends IBaseBlockWithIdAndMetadata {
  children?: IBlock[];
  parent?: TBlockId;
}
export interface IBlockDto extends IBaseBlockWithIdAndMetadata {
  children?: string[];
  parent?: string;
  order?: number;
}
export interface ICreateBlockDto extends IBaseBlock {
  parent?: string;
  order?: number;
  metadata?: IBlockMetadata;
}
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
export interface IBlockListDto {
  blocks: IBlockDto[];
  total: number;
  page?: number;
  limit?: number;
}
export type TBlock = IBlockDto;
export type TBlockWithChildren = Omit<IBlockDto, 'children'> & { children: TBlockWithChildren[] };