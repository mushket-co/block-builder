export type TCountLabelVariants = {
  one: string;
  few: string;
  many: string;
  zero?: string;
};

export function getRepeaterCountText(
  count: number,
  variants?: TCountLabelVariants
): string {
  if (!variants) {
    return `${count}`;
  }
  const mod10 = count % 10;
  const mod100 = count % 100;
  let labelForm = variants.many;
  if (count === 0 && variants.zero) {
    labelForm = variants.zero;
  } else if (mod10 === 1 && mod100 !== 11) {
    labelForm = variants.one;
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    labelForm = variants.few;
  }
  return `${count} ${labelForm}`;
}
