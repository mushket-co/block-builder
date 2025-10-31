import {
  IBlock,
  IBlockSettings,
  IBlockProps,
  IBlockStyle,
  TBlockId,
  TRenderRef,
  IFormGenerationConfig
} from '../types';
import { deepClone } from '../../utils/deepClone';

/**
 * Доменная сущность блока
 * Содержит бизнес-логику для работы с блоками
 */
export class BlockEntity {
  private _block: IBlock;

  constructor(block: IBlock) {
  this._block = deepClone(block);
  }

  get id(): TBlockId {
  return this._block.id;
  }

  get type(): string {
  return this._block.type;
  }

  get settings(): IBlockSettings {
  return deepClone(this._block.settings);
  }

  get props(): IBlockProps {
  return deepClone(this._block.props);
  }

  get style(): IBlockStyle | undefined {
  return this._block.style ? { ...this._block.style } : undefined;
  }


  get render(): TRenderRef | undefined {
  return this._block.render;
  }

  get children(): IBlock[] {
  return this._block.children ? [...this._block.children] : [];
  }

  get parent(): TBlockId | undefined {
  return this._block.parent;
  }

  get visible(): boolean {
  return this._block.visible ?? true;
  }

  get locked(): boolean {
  return this._block.locked ?? false;
  }

  get metadata() {
  return this._block.metadata;
  }

  get formConfig(): IFormGenerationConfig | undefined {
  return this._block.formConfig;
  }

  /**
   * Обновляет настройки блока
   */
  updateSettings(settings: Partial<IBlockSettings>): void {
  this._block.settings = { ...this._block.settings, ...settings };
  this._updateMetadata();
  }

  /**
   * Обновляет свойства блока
   */
  updateProps(props: Partial<IBlockProps>): void {
  this._block.props = { ...this._block.props, ...props };
  this._updateMetadata();
  }

  /**
   * Обновляет стили блока
   */
  updateStyle(style: Partial<IBlockStyle>): void {
  this._block.style = { ...this._block.style, ...style } as IBlockStyle;
  this._updateMetadata();
  }

  /**
   * Обновляет конфигурацию формы
   */
  updateFormConfig(formConfig: IFormGenerationConfig): void {
  this._block.formConfig = { ...formConfig };
  this._updateMetadata();
  }


  /**
   * Блокирует/разблокирует блок
   */
  setLocked(locked: boolean): void {
  this._block.locked = locked;
  this._updateMetadata();
  }

  /**
   * Показывает/скрывает блок
   */
  setVisible(visible: boolean): void {
  this._block.visible = visible;
  this._updateMetadata();
  }

  /**
   * Добавляет дочерний блок
   */
  addChild(child: IBlock): void {
  if (!this._block.children) {
    this._block.children = [];
  }
  this._block.children.push(child);
  this._updateMetadata();
  }

  /**
   * Удаляет дочерний блок
   */
  removeChild(childId: TBlockId): boolean {
  if (!this._block.children) return false;

  const index = this._block.children.findIndex(child => child.id === childId);
  if (index === -1) return false;

  this._block.children.splice(index, 1);
  this._updateMetadata();
  return true;
  }

  /**
   * Проверяет, является ли блок дочерним для данного
   */
  hasChild(childId: TBlockId): boolean {
  return this._block.children?.some(child => child.id === childId) ?? false;
  }

  /**
   * Проверяет, можно ли редактировать блок
   */
  canEdit(): boolean {
  return !this.locked && this.visible;
  }

  /**
   * Проверяет, можно ли удалить блок
   */
  canDelete(): boolean {
  return !this.locked;
  }

  /**
   * Клонирует блок с новым ID
   */
  clone(newId: TBlockId): BlockEntity {
  const clonedBlock: IBlock = {
    ...this._block,
    id: newId,
    children: this._block.children?.map(child => ({ ...child })),
    metadata: {
      ...this._block.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }
  };

  return new BlockEntity(clonedBlock);
  }

  /**
   * Возвращает сериализованный блок
   */
  toJSON(): IBlock {
  return deepClone(this._block);
  }

  /**
   * Обновляет метаданные
   */
  private _updateMetadata(): void {
  if (!this._block.metadata) {
    this._block.metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
  } else {
    this._block.metadata.updatedAt = new Date();
    this._block.metadata.version += 1;
  }
  }
}
