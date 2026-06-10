import { CSS_CLASSES } from '../../utils/constants';
interface IAddBlockSeparatorProps {
  onAdd: () => void;
}

export function AddBlockSeparator({ onAdd }: IAddBlockSeparatorProps) {
  return (
    <div className={CSS_CLASSES.ADD_BLOCK_SEPARATOR}>
      <button type="button" className={CSS_CLASSES.ADD_BLOCK_BTN} title="Добавить блок" onClick={onAdd}>
        <span className={CSS_CLASSES.ADD_BLOCK_BTN_ICON}>+</span>
        <span className={CSS_CLASSES.ADD_BLOCK_BTN_TEXT}>Добавить блок</span>
      </button>
    </div>
  );
}
