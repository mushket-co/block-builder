import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from '../dto/BlockDto';

/**
 * Port (интерфейс) для работы с блоками
 * Определяет контракт для внешнего мира
 */
export interface IBlockRepository {
  /**
   * Создать блок
   */
  create(blockData: ICreateBlockDto): Promise<IBlockDto>;

  /**
   * Получить блок по ID
   */
  getById(id: string): Promise<IBlockDto | null>;

  /**
   * Получить все блоки
   */
  getAll(): Promise<IBlockDto[]>;

  /**
   * Получить блоки по типу
   */
  getByType(type: string): Promise<IBlockDto[]>;

  /**
   * Получить дочерние блоки
   */
  getChildren(parentId: string): Promise<IBlockDto[]>;

  /**
   * Обновить блок
   */
  update(id: string, updates: IUpdateBlockDto): Promise<IBlockDto>;

  /**
   * Удалить блок
   */
  delete(id: string): Promise<boolean>;

  /**
   * Проверить существование блока
   */
  exists(id: string): Promise<boolean>;

  /**
   * Получить количество блоков
   */
  count(): Promise<number>;

  /**
   * Очистить все блоки
   */
  clear(): Promise<void>;
}
