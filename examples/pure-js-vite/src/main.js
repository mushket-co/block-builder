import './style.css'
// Импортируем CSS стили BlockBuilder
import '@mushket-co/block-builder/index.esm.css'
import { BlockBuilder } from '@mushket-co/block-builder'
import { blockConfigs } from './block-config.js'
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer.js'
import {
  loadBlocksFromLocalStorage,
  saveBlocksToLocalStorage,
} from '../../shared/blockStorage.js'

// Инициализация BlockBuilder
const blockBuilder = new BlockBuilder({
  containerId: 'block-builder-container',
  blockConfigs: blockConfigs,
  theme: 'light',
  locale: 'ru',
  controlsContainerClass: 'container', // Кастомный CSS класс для контейнера контролов
  controlsFixedPosition: 'bottom', // Фиксировать контролы (с кнопками и статистикой) снизу
  controlsOffset: 20, // Отступ от края в 20px
  initialBlocks: loadBlocksFromLocalStorage(),
  isEdit: true, // Режим редактирования (можно установить false для режима только просмотра)
  onSave: async (blocks) => {
    const result = saveBlocksToLocalStorage(blocks)

    if (!result.ok) {
      console.error('Ошибка сохранения:', result.error)
      return false
    }

    if (result.strippedImages) {
      console.warn(
        'localStorage: base64-изображения не сохранены (лимит браузера). Загружайте файлы на сервер или используйте URL.'
      )
    }

    return true
  },
})

// ✅ Регистрируем кастомный WYSIWYG редактор
blockBuilder.registerCustomFieldRenderer(new WysiwygFieldRenderer())

// Экспортируем в window для тестирования через консоль браузера
window.blockBuilder = blockBuilder

// Примеры использования через консоль:
// window.blockBuilder.setIsEdit(false) - отключить редактирование
// window.blockBuilder.setIsEdit(true) - включить редактирование
// window.blockBuilder.getIsEdit() - получить текущий режим
console.log('💡 Для тестирования режима редактирования используйте в консоли:')
console.log('   window.blockBuilder.setIsEdit(false) - режим просмотра')
console.log('   window.blockBuilder.setIsEdit(true) - режим редактирования')
console.log('   window.blockBuilder.getIsEdit() - текущий режим')
