import type { ICON_SYMBOLS } from '../../../shared/icons/sprite';
import { ICON_SYMBOLS as symbols } from '../../../shared/icons/sprite';

interface IIconProps {
  name: keyof typeof ICON_SYMBOLS;
  width?: number;
  height?: number;
  className?: string;
}

export function Icon({ name, width = 16, height = 16, className = '' }: IIconProps) {
  const content = symbols[name];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
