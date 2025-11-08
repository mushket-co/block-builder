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
  
  updateSettings(settings: Partial<IBlockSettings>): void {
  this._block.settings = { ...this._block.settings, ...settings };
  this._updateMetadata();
  }
  
  updateProps(props: Partial<IBlockProps>): void {
  this._block.props = { ...this._block.props, ...props };
  this._updateMetadata();
  }
  
  updateStyle(style: Partial<IBlockStyle>): void {
  this._block.style = { ...this._block.style, ...style } as IBlockStyle;
  this._updateMetadata();
  }
  
  updateFormConfig(formConfig: IFormGenerationConfig): void {
  this._block.formConfig = { ...formConfig };
  this._updateMetadata();
  }
  
  setLocked(locked: boolean): void {
  this._block.locked = locked;
  this._updateMetadata();
  }
  setVisible(visible: boolean): void {
  this._block.visible = visible;
  this._updateMetadata();
  }
  
  addChild(child: IBlock): void {
  if (!this._block.children) {
    this._block.children = [];
  }
  this._block.children.push(child);
  this._updateMetadata();
  }
  
  removeChild(childId: TBlockId): boolean {
  if (!this._block.children) return false;
  const index = this._block.children.findIndex(child => child.id === childId);
  if (index === -1) return false;
  this._block.children.splice(index, 1);
  this._updateMetadata();
  return true;
  }
  
  hasChild(childId: TBlockId): boolean {
  return this._block.children?.some(child => child.id === childId) ?? false;
  }
  
  canEdit(): boolean {
  return !this.locked && this.visible;
  }
  
  canDelete(): boolean {
  return !this.locked;
  }
  
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
  
  toJSON(): IBlock {
  return deepClone(this._block);
  }
  
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