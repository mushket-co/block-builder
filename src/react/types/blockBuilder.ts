import type { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import type { IBlock, TBlockId } from '../../core/types';
import type { IFormFieldConfig } from '../../core/types/form';
import type { IBlockFormHooks } from '../../core/types/formHooks';
import type { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import type { BlockManagementUseCase } from '../../core/use-cases/BlockManagementUseCase';
import type { IUiThemeVars, TUiTheme } from '../../shared/theme/uiTheme';
import type { IUiStrings, TUiLocale } from '../../shared/i18n/uiStrings';

/** Конфиг типа блока для React BlockBuilder (formHooks — Vue/React UI) */
export interface IBlockType {
  type: string;
  label: string;
  title?: string;
  icon?: string;
  render?: IBlock['render'];
  defaultSettings?: Record<string, unknown>;
  defaultProps?: Record<string, unknown>;
  fields?: IFormFieldConfig[];
  /** Per-block modal hooks — Vue/React BlockBuilder only */
  formHooks?: IBlockFormHooks;
  spacingOptions?: { config?: { breakpoints?: Array<{ name: string; label: string; maxWidth?: number }> } };
}

export interface IBlockBuilderProps {
  config?: {
    availableBlockTypes?: IBlockType[];
  };
  blockManagementUseCase: BlockManagementUseCase;
  apiSelectUseCase?: ApiSelectUseCase;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  onSave?: (blocks: IBlock[]) => Promise<boolean> | boolean;
  initialBlocks?: IBlock[];
  controlsContainerClass?: string;
  controlsFixedPosition?: 'top' | 'bottom';
  controlsOffset?: number;
  controlsOffsetVar?: string;
  isEdit?: boolean;
  warnOnPageLeave?: boolean;
  onBlockAdded?: (block: IBlock) => void;
  onBlockUpdated?: (block: IBlock) => void;
  onBlockDeleted?: (blockId: TBlockId) => void;
  /** UI locale preset (`ru` default) */
  locale?: TUiLocale;
  /** Override built-in UI strings */
  uiStrings?: Partial<IUiStrings>;
  /** UI theme preset (`default` when omitted) */
  theme?: TUiTheme;
  /** Override CSS custom properties on `.bb-app` root */
  themeVars?: IUiThemeVars;
}
