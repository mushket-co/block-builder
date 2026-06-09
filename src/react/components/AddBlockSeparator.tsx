interface IAddBlockSeparatorProps {
  onAdd: () => void;
}

export function AddBlockSeparator({ onAdd }: IAddBlockSeparatorProps) {
  return (
    <div className="bb-add-block-separator">
      <button type="button" className="bb-add-block-btn" title="Добавить блок" onClick={onAdd}>
        <span className="bb-add-block-btn__icon">+</span>
        <span className="bb-add-block-btn__text">Добавить блок</span>
      </button>
    </div>
  );
}
