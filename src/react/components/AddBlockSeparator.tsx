import { CSS_CLASSES } from '../../utils/constants';
import { useUiStrings } from '../context/uiStringsContext';

interface IAddBlockSeparatorProps {
  onAdd: () => void;
}

export function AddBlockSeparator({ onAdd }: IAddBlockSeparatorProps) {
  const uiStrings = useUiStrings();

  return (
    <div className={CSS_CLASSES.ADD_BLOCK_SEPARATOR}>
      <button
        type="button"
        className={CSS_CLASSES.ADD_BLOCK_BTN}
        title={uiStrings.addBlock}
        onClick={onAdd}
      >
        <span className={CSS_CLASSES.ADD_BLOCK_BTN_ICON}>+</span>
        <span className={CSS_CLASSES.ADD_BLOCK_BTN_TEXT}>{uiStrings.addBlock}</span>
      </button>
    </div>
  );
}
