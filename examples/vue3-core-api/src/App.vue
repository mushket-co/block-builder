<template>
  <div class="app">
    <!-- Заголовок -->
    <div class="app-header">
      <h1>Block Builder - Vue3 Core API Example</h1>
      <p class="app-description">
        Демонстрация использования только Core API без готовых UI компонентов
      </p>
    </div>

    <!-- Главная панель инструментов -->
    <div class="toolbar">
      <div class="toolbar-group">
        <button class="btn" @click="showTypeModal = true">+ Добавить блок</button>
        <button class="btn btn-secondary" @click="addRandomBlocks">Добавить примеры</button>
      </div>

      <div class="toolbar-group">
        <button class="btn btn-secondary" @click="exportBlocks">Экспорт</button>
        <button class="btn btn-secondary" @click="downloadBlocks">Скачать JSON</button>
        <button class="btn btn-secondary" @click="uploadBlocks">Загрузить JSON</button>
      </div>

      <div class="toolbar-group">
        <button class="btn btn-secondary" @click="showBlocksCount">Количество</button>
        <button class="btn btn-secondary" @click="showBlocksByType">Фильтр по типу</button>
        <button class="btn btn-danger btn-sm" @click="clearAllBlocks">Очистить все</button>
      </div>
    </div>

    <!-- Дополнительные инструменты -->
    <div class="toolbar toolbar-secondary">
      <div class="toolbar-group">
        <button class="btn btn-sm" @click="toggleLogsPanel">{{ showLogs ? 'Скрыть' : 'Показать' }} логи</button>
        <button class="btn btn-sm" @click="showComponentDemo">Тест компонентов</button>
        <button class="btn btn-sm" @click="showCustomFieldDemo">Тест кастомных полей</button>
        <button class="btn btn-sm" @click="showConfigDemo">Тест конфигов</button>
        <button class="btn btn-sm" @click="reverseOrder">Обратить порядок</button>
      </div>
    </div>

    <!-- Контент -->
    <div class="app-content">
      <BlockList
        :blocks="blocks"
        @add-block="showTypeModal = true"
        @edit="handleEdit"
        @delete="handleDelete"
        @duplicate="handleDuplicate"
        @toggle-lock="handleToggleLock"
        @toggle-visibility="handleToggleVisibility"
        @move-up="handleMoveUp"
        @move-down="handleMoveDown"
      />
    </div>

    <!-- Панель логов -->
    <div v-if="showLogs" class="logs-panel">
      <div class="logs-header">
        <h3>Логи операций</h3>
        <button class="btn btn-sm" @click="clearLogs">Очистить</button>
      </div>
      <div class="logs-content" ref="logsContent">
        <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
          <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
        </div>
        <div v-if="logs.length === 0" class="log-entry log-empty">
          Логи отсутствуют
        </div>
      </div>
    </div>

    <!-- Модальное окно выбора типа блока -->
    <BlockTypeModal
      :show="showTypeModal"
      :block-configs="blockConfigs"
      @close="showTypeModal = false"
      @select="handleTypeSelect"
    />

    <!-- Модальное окно формы -->
    <BlockFormModal
      :show="showFormModal"
      :fields="currentFields"
      :initial-data="editingBlock?.props"
      :is-edit="!!editingBlock"
      @close="handleFormClose"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { BlockBuilder } from '@mushket-co/block-builder/core'
import { blockConfigs } from './configs/block-config'
import BlockTypeModal from './components/BlockTypeModal.vue'
import BlockFormModal from './components/BlockFormModal.vue'
import BlockList from './components/BlockList.vue'

// Состояние UI
const blocks = ref([])
const showTypeModal = ref(false)
const showFormModal = ref(false)
const currentFields = ref([])
const currentBlockType = ref('')
const editingBlock = ref(null)
const showLogs = ref(false)
const logs = ref([])
const logsContent = ref(null)

// Инициализация BlockBuilder
let blockBuilder = null

onMounted(async () => {
  addLog('🚀 Инициализация BlockBuilder Core API...', 'info')

  // Создаем экземпляр BlockBuilder БЕЗ UI (используем только core)
  blockBuilder = new BlockBuilder({
    blockConfigs,
    autoInit: false // Не инициализируем UI (без containerId)
  })

  addLog('✅ BlockBuilder Core API инициализирован', 'success')

  // Загружаем сохранённые блоки
  await loadBlocks()

  // Добавляем примеры, если блоков нет
  if (blocks.value.length === 0) {
    await addExampleBlocks()
  }

  addLog('🚀 Приложение готово к работе', 'success')
})

// Загрузка блоков
const loadBlocks = async () => {
  blocks.value = await blockBuilder.getAllBlocks()
}

// Добавление примеров
const addExampleBlocks = async () => {
  const examples = [
    {
      type: 'text',
      props: {
        content: 'Добро пожаловать в Block Builder Core API!',
        fontSize: 18,
        color: '#333333'
      },
      settings: {}
    },
    {
      type: 'card',
      props: {
        title: 'Пример карточки',
        description: 'Это демонстрационный блок карточки',
        bgColor: '#ffffff',
        borderColor: '#007bff'
      },
      settings: {}
    }
  ]

  addLog('📝 Добавление примеров блоков...', 'info')

  for (const block of examples) {
    await blockBuilder.createBlock(block)
  }

  await loadBlocks()
  addLog(`✅ Добавлено ${examples.length} примеров блоков`, 'success')
}

// Обработчики событий
const handleTypeSelect = (type) => {
  const config = blockConfigs[type]
  if (!config) return

  currentBlockType.value = type
  currentFields.value = config.fields || []
  editingBlock.value = null
  showTypeModal.value = false
  showFormModal.value = true
}

const handleEdit = (block) => {
  const config = blockConfigs[block.type]
  if (!config) return

  currentFields.value = config.fields || []
  editingBlock.value = block
  showFormModal.value = true
}

const handleFormClose = () => {
  showFormModal.value = false
  editingBlock.value = null
  currentFields.value = []
  currentBlockType.value = ''
}

const handleFormSubmit = async (formData) => {
  try {
    if (editingBlock.value) {
      // Редактирование существующего блока
      await blockBuilder.updateBlock(editingBlock.value.id, { props: formData })
      addLog(`✅ Блок ${editingBlock.value.id} обновлён`, 'success')
    } else {
      // Создание нового блока
      const newBlock = await blockBuilder.createBlock({
        type: currentBlockType.value,
        props: formData,
        settings: {}
      })
      addLog(`✅ Блок ${newBlock.id} создан`, 'success', formData)
    }

    await loadBlocks()
    handleFormClose()
  } catch (error) {
    addLog(`❌ Ошибка: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
    alert('Ошибка: ' + error.message)
  }
}

const handleDelete = async (id) => {
  if (!confirm('Удалить блок?')) return

  try {
    await blockBuilder.deleteBlock(id)
    addLog(`🗑️ Блок ${id} удалён`, 'success')
    await loadBlocks()
  } catch (error) {
    addLog(`❌ Ошибка удаления: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const handleDuplicate = async (id) => {
  try {
    const duplicated = await blockBuilder.duplicateBlock(id)
    addLog(`📄 Блок ${id} продублирован`, 'success', duplicated)
    await loadBlocks()
  } catch (error) {
    addLog(`❌ Ошибка дублирования: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const handleToggleLock = async (id) => {
  try {
    const block = await blockBuilder.getBlock(id)
    if (!block) return

    const newLocked = !block.locked
    await blockBuilder.setBlockLocked(id, newLocked)
    addLog(`🔒 Блок ${id} ${newLocked ? 'заблокирован' : 'разблокирован'}`, 'info')
    await loadBlocks()
  } catch (error) {
    addLog(`❌ Ошибка блокировки: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const handleToggleVisibility = async (id) => {
  try {
    const block = await blockBuilder.getBlock(id)
    if (!block) return

    const newVisible = !block.visible
    await blockBuilder.setBlockVisible(id, newVisible)
    addLog(`👁️ Блок ${id} ${newVisible ? 'показан' : 'скрыт'}`, 'info')
    await loadBlocks()
  } catch (error) {
    addLog(`❌ Ошибка видимости: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const handleMoveUp = async (id) => {
  try {
    const currentIndex = blocks.value.findIndex(b => b.id === id)
    if (currentIndex <= 0) return

    const newOrder = [...blocks.value.map(b => b.id)]
    const temp = newOrder[currentIndex]
    newOrder[currentIndex] = newOrder[currentIndex - 1]
    newOrder[currentIndex - 1] = temp

    await blockBuilder.reorderBlocks(newOrder)
    addLog(`↑ Блок ${id} перемещен вверх`, 'info')
    await loadBlocks()
  } catch (error) {
    addLog(`❌ Ошибка перемещения: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const handleMoveDown = async (id) => {
  try {
    const currentIndex = blocks.value.findIndex(b => b.id === id)
    if (currentIndex >= blocks.value.length - 1) return

    const newOrder = [...blocks.value.map(b => b.id)]
    const temp = newOrder[currentIndex]
    newOrder[currentIndex] = newOrder[currentIndex + 1]
    newOrder[currentIndex + 1] = temp

    await blockBuilder.reorderBlocks(newOrder)
    addLog(`↓ Блок ${id} перемещен вниз`, 'info')
    await loadBlocks()
  } catch (error) {
    addLog(`❌ Ошибка перемещения: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const exportBlocks = async () => {
  try {
    const json = await blockBuilder.exportBlocks()
    addLog('💾 Экспорт блоков выполнен', 'success')
    alert('✅ Блоки экспортированы. Смотрите панель логов')
  } catch (error) {
    addLog(`❌ Ошибка экспорта: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const importBlocks = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const success = await blockBuilder.importBlocks(text)

      if (success) {
        await loadBlocks()
        addLog('⬆️ Блоки импортированы из JSON', 'success')
        alert('✅ Блоки импортированы')
      } else {
        addLog('❌ Ошибка импорта', 'error')
        alert('❌ Ошибка импорта')
      }
    } catch (error) {
      addLog(`❌ Ошибка импорта: ${error.message}`, 'error')
      console.error('❌ Ошибка:', error)
      alert('Ошибка: ' + error.message)
    }
  }

  input.click()
}

const showBlocksCount = async () => {
  const count = await blockBuilder.getBlocksCount()
  addLog(`📊 Количество блоков: ${count}`, 'info')
  alert(`Всего блоков: ${count}`)
}

const clearAllBlocks = async () => {
  if (!confirm('Удалить все блоки?')) return

  try {
    await blockBuilder.clearAllBlocks()
    addLog('🗑️ Все блоки удалены', 'success')
    await loadBlocks()
  } catch (error) {
    addLog(`❌ Ошибка удаления: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

// ===== ФУНКЦИИ ДЛЯ ЛОГОВ =====
const addLog = (message, type = 'info', data = null) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift({
    time: timestamp,
    message,
    type,
    data
  })
  
  // Ограничиваем количество логов
  if (logs.value.length > 100) {
    logs.value.pop()
  }
  
  // Автоматическая прокрутка
  nextTick(() => {
    if (logsContent.value) {
      logsContent.value.scrollTop = 0
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const toggleLogsPanel = () => {
  showLogs.value = !showLogs.value
  if (showLogs.value) {
    addLog('Панель логов открыта')
  }
}

// ===== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ =====
const addRandomBlocks = async () => {
  const examples = [
    { type: 'text', props: { content: 'Пример текстового блока', fontSize: 16, color: '#333333' } },
    { type: 'image', props: { src: '/1.jpeg', alt: 'Пример изображения' } },
    { type: 'card', props: { title: 'Пример карточки', description: 'Описание карточки', bgColor: '#ffffff', borderColor: '#007bff' } },
    { type: 'hero', props: { title: 'Hero секция', subtitle: 'Подзаголовок', bgImage: '/1.jpeg' } }
  ]

  addLog('📝 Добавление примеров блоков...', 'info')
  
  for (const example of examples) {
    await blockBuilder.createBlock({
      type: example.type,
      props: example.props,
      settings: {}
    })
  }

  await loadBlocks()
  addLog(`✅ Добавлено ${examples.length} примеров`, 'success')
}

const downloadBlocks = async () => {
  try {
    const json = await blockBuilder.exportBlocks()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blocks-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    addLog('⬇️ Блоки скачаны как JSON файл', 'success')
  } catch (error) {
    addLog(`❌ Ошибка скачивания: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const uploadBlocks = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const success = await blockBuilder.importBlocks(text)

      if (success) {
        await loadBlocks()
        addLog('⬆️ Блоки импортированы из файла', 'success')
      } else {
        addLog('❌ Ошибка импорта. Проверьте формат файла.', 'error')
      }
    } catch (error) {
      addLog(`❌ Ошибка импорта: ${error.message}`, 'error')
      console.error('❌ Ошибка:', error)
    }
  }

  input.click()
}

const showBlocksByType = async () => {
  const types = blockBuilder.getAvailableBlockTypes()
  const selectedType = prompt(`Введите тип блока:\n${types.join(', ')}`, 'text')

  if (selectedType && blockBuilder.hasBlockType(selectedType)) {
    const filteredBlocks = await blockBuilder.getBlocksByType(selectedType)
    addLog(`📋 Найдено блоков типа '${selectedType}': ${filteredBlocks.length}`, 'info', filteredBlocks)
    alert(`Найдено блоков типа "${selectedType}": ${filteredBlocks.length}\n\nСмотрите панель логов`)
  } else {
    addLog(`❌ Неизвестный тип блока: ${selectedType}`, 'error')
    alert('Неизвестный тип блока')
  }
}

const reverseOrder = async () => {
  try {
    const currentBlocks = await blockBuilder.getAllBlocks()
    if (currentBlocks.length === 0) {
      addLog('❌ Нет блоков для реорганизации', 'error')
      return
    }

    const reversedIds = [...currentBlocks].reverse().map(b => b.id)
    await blockBuilder.reorderBlocks(reversedIds)
    await loadBlocks()
    addLog('🔄 Порядок блоков обращен', 'success')
  } catch (error) {
    addLog(`❌ Ошибка реорганизации: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const showComponentDemo = async () => {
  try {
    // Регистрация компонента
    const componentName = 'demoComponent'
    blockBuilder.registerComponent(componentName, {
      name: componentName,
      template: '<div class="demo-component">Демо компонент</div>',
      props: {}
    })
    addLog(`📝 Компонент "${componentName}" зарегистрирован`, 'success')

    // Получение всех компонентов
    const allComponents = blockBuilder.getAllComponents()
    addLog(`📚 Всего компонентов: ${Object.keys(allComponents).length}`, 'info', allComponents)

    // Проверка существования
    const exists = blockBuilder.hasComponent(componentName)
    addLog(`✅ Компонент "${componentName}" существует: ${exists}`, 'info')

    alert(`Демонстрация работы с компонентами:\n\nЗарегистрировано: ${componentName}\nВсего компонентов: ${Object.keys(allComponents).length}\n\nСмотрите панель логов`)
  } catch (error) {
    addLog(`❌ Ошибка демо компонентов: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const showCustomFieldDemo = async () => {
  try {
    // Регистрация рендерера
    const fieldId = 'demo-field'
    blockBuilder.registerCustomFieldRenderer({
      id: fieldId,
      name: 'Демо поле',
      render: (field, value, onChange) => {
        return document.createElement('input')
      }
    })
    addLog(`🎨 Кастомное поле "${fieldId}" зарегистрировано`, 'success')

    // Получение всех рендереров
    const allRenderers = blockBuilder.getAllCustomFieldRenderers()
    addLog(`🎨 Всего кастомных полей: ${allRenderers.size}`, 'info', Array.from(allRenderers.entries()))

    // Проверка существования
    const exists = blockBuilder.hasCustomFieldRenderer(fieldId)
    addLog(`✅ Кастомное поле "${fieldId}" существует: ${exists}`, 'info')

    alert(`Демонстрация работы с кастомными полями:\n\nЗарегистрировано: ${fieldId}\nВсего полей: ${allRenderers.size}\n\nСмотрите панель логов`)
  } catch (error) {
    addLog(`❌ Ошибка демо кастомных полей: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}

const showConfigDemo = async () => {
  try {
    const configs = blockBuilder.getBlockConfigs()
    const types = blockBuilder.getAvailableBlockTypes()
    
    addLog(`⚙️ Всего типов блоков: ${types.length}`, 'info', configs)

    const demoType = types[0]
    if (demoType) {
      const config = blockBuilder.getBlockConfig(demoType)
      const hasType = blockBuilder.hasBlockType(demoType)
      
      addLog(`📋 Конфигурация типа '${demoType}':`, 'info', config)
      addLog(`✅ Тип '${demoType}' существует: ${hasType}`, 'info')
    }

    alert(`Демонстрация конфигураций:\n\nДоступно типов: ${types.length}\nТипы: ${types.join(', ')}\n\nСмотрите панель логов`)
  } catch (error) {
    addLog(`❌ Ошибка демо конфигов: ${error.message}`, 'error')
    console.error('❌ Ошибка:', error)
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.app-header {
  background: white;
  padding: 32px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
}

.app-header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.app-description {
  color: #666;
  font-size: 14px;
}

.toolbar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
}

.toolbar.toolbar-secondary {
  background: #f8f9fa;
}

.toolbar-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.app-content {
  margin-top: 24px;
}

/* Панель логов */
.logs-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 400px;
  background: #1e1e1e;
  border-top: 2px solid #007bff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
}

.logs-header h3 {
  color: white;
  margin: 0;
  font-size: 14px;
}

.logs-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-entry {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  background: #2d2d2d;
  color: #d4d4d4;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-entry.success {
  background: #1e4d1e;
}

.log-entry.error {
  background: #4d1e1e;
  color: #ffcccc;
}

.log-entry.info {
  background: #1e3a4d;
}

.log-entry.log-empty {
  text-align: center;
  color: #666;
  font-style: italic;
}

.log-time {
  color: #888;
  font-size: 10px;
}

.log-message {
  color: inherit;
}

.log-data {
  margin-top: 8px;
  padding: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  font-size: 11px;
  color: #d4d4d4;
  overflow-x: auto;
}

/* Стили кнопок */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #dc3545;
  color: white;
}
</style>

