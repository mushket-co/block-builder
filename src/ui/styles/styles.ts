/**
 * Экспорт SCSS стилей как строки для инъекции в DOM
 * Этот файл используется для встраивания стилей в JS бандл
 */

// Импортируем SCSS (будет обработан rollup-plugin-postcss + sass)
import styles from './index.scss';

export { styles };
export default styles;
