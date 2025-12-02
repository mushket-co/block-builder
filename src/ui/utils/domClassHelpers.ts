import { CSS_CLASSES } from '../../utils/constants';

export function updateBodyEditModeClass(isEdit: boolean | undefined): void {
  if (isEdit) {
    document.body.classList.add(CSS_CLASSES.BB_IS_EDIT_MODE);
  } else {
    document.body.classList.remove(CSS_CLASSES.BB_IS_EDIT_MODE);
  }
}
