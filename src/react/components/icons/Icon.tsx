import type { ICON_SYMBOLS } from '../../../shared/icons/sprite';
import { ICON_SYMBOLS as symbols, resolveIconUsesFill, resolveIconViewBox } from '../../../shared/icons/sprite';

interface IIconProps {
  name: keyof typeof ICON_SYMBOLS;
  width?: number;
  height?: number;
  className?: string;
}

export function Icon({ name, width = 16, height = 16, className = '' }: IIconProps) {
  const content = symbols[name];
  const viewBox = resolveIconViewBox(name);
  const usesFill = resolveIconUsesFill(name);
  const iconClass = [className, usesFill ? 'bb-icon--filled' : 'bb-icon--stroke'].filter(Boolean).join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill={usesFill ? 'currentColor' : 'none'}
      stroke={usesFill ? 'none' : 'currentColor'}
      strokeWidth={usesFill ? undefined : 1}
      strokeLinecap={usesFill ? undefined : 'round'}
      strokeLinejoin={usesFill ? undefined : 'round'}
      className={iconClass}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
