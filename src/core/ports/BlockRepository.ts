import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from '../dto/BlockDto';
export interface IBlockRepository {
  
  create(blockData: ICreateBlockDto): Promise<IBlockDto>;
  
  getById(id: string): Promise<IBlockDto | null>;
  
  getAll(): Promise<IBlockDto[]>;
  
  getByType(type: string): Promise<IBlockDto[]>;
  
  getChildren(parentId: string): Promise<IBlockDto[]>;
  
  update(id: string, updates: IUpdateBlockDto): Promise<IBlockDto>;
  
  delete(id: string): Promise<boolean>;
  
  exists(id: string): Promise<boolean>;
  
  count(): Promise<number>;
  
  clear(): Promise<void>;
}