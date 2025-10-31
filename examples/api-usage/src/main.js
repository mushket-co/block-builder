import './style.css'
import { BlockBuilder } from '@mushket-co/block-builder/core'

// Расширенная конфигурация блоков для демонстрации различных возможностей
const blockConfigs = {
  text: {
    title: 'Текстовый блок',
    icon: '📝',
    description: 'Простой текстовый блок',
    render: {
      kind: 'html',
      template: (props) => `
        <div class="text-block" style="padding: 1rem; background: white; border-radius: 4px; margin-bottom: 1rem;">
          <p style="font-size: ${props.fontSize || 16}px; color: ${props.color || '#333'};">
            ${props.content || 'Пустой текст'}
          </p>
        </div>
      `
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        defaultValue: 'Новый текстовый блок'
      },
      {
        field: 'fontSize',
        label: 'Размер шрифта',
        type: 'number',
        defaultValue: 16
      },
      {
        field: 'color',
        label: 'Цвет',
        type: 'color',
        defaultValue: '#333333'
      }
    ]
  },
  image: {
    title: 'Блок изображения',
    icon: '🖼️',
    description: 'Простой блок с изображением',
    render: {
      kind: 'html',
      template: (props) => `
        <div class="image-block" style="padding: 1rem; background: white; border-radius: 4px; margin-bottom: 1rem; text-align: center;">
          <img src="${props.src || '/1.jpeg'}"
               alt="${props.alt || 'Изображение'}"
               style="max-width: 100%; border-radius: 4px;" />
        </div>
      `
    },
    fields: [
      {
        field: 'src',
        label: 'URL изображения',
        type: 'text',
        defaultValue: '/1.jpeg'
      },
      {
        field: 'alt',
        label: 'Описание',
        type: 'text',
        defaultValue: 'Изображение'
      }
    ]
  },
  card: {
    title: 'Карточка',
    icon: '🃏',
    description: 'Блок-карточка с заголовком и текстом',
    render: {
      kind: 'html',
      template: (props) => `
        <div class="card-block" style="padding: 2rem; background: ${props.bgColor || 'white'}; border: 2px solid ${props.borderColor || '#ddd'}; border-radius: 8px; margin-bottom: 1rem;">
          <h3 style="margin-top: 0; color: ${props.titleColor || '#333'};">
            ${props.title || 'Заголовок карточки'}
          </h3>
          <p style="color: ${props.textColor || '#666'};">
            ${props.description || 'Описание карточки'}
          </p>
        </div>
      `
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        defaultValue: 'Заголовок карточки'
      },
      {
        field: 'description',
        label: 'Описание',
        type: 'textarea',
        defaultValue: 'Описание карточки'
      },
      {
        field: 'bgColor',
        label: 'Цвет фона',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        field: 'borderColor',
        label: 'Цвет рамки',
        type: 'color',
        defaultValue: '#dddddd'
      },
      {
        field: 'titleColor',
        label: 'Цвет заголовка',
        type: 'color',
        defaultValue: '#333333'
      },
      {
        field: 'textColor',
        label: 'Цвет текста',
        type: 'color',
        defaultValue: '#666666'
      }
    ]
  },
  hero: {
    title: 'Hero секция',
    icon: '🎯',
    description: 'Главная секция с изображением и текстом',
    render: {
      kind: 'html',
      template: (props) => `
        <div class="hero-block" style="position: relative; height: 400px; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${props.bgImage || '/1.jpeg'}); background-size: cover; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 1rem;">
          <div style="text-align: center; padding: 2rem;">
            <h1 style="font-size: ${props.titleSize || 48}px; margin: 0 0 1rem 0;">
              ${props.title || 'Заголовок Hero'}
            </h1>
            <p style="font-size: ${props.subtitleSize || 20}px; margin: 0;">
              ${props.subtitle || 'Подзаголовок Hero'}
            </p>
          </div>
        </div>
      `
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        defaultValue: 'Заголовок Hero'
      },
      {
        field: 'subtitle',
        label: 'Подзаголовок',
        type: 'text',
        defaultValue: 'Подзаголовок Hero'
      },
      {
        field: 'bgImage',
        label: 'Фоновое изображение',
        type: 'text',
        defaultValue: '/1.jpeg'
      },
      {
        field: 'titleSize',
        label: 'Размер заголовка',
        type: 'number',
        defaultValue: 48
      },
      {
        field: 'subtitleSize',
        label: 'Размер подзаголовка',
        type: 'number',
        defaultValue: 20
      }
    ]
  }
}

// Загрузка сохранённых блоков из localStorage
const loadSavedBlocks = () => {
  try {
    const savedData = localStorage.getItem('saved-blocks')
    if (savedData) {
      const blocks = JSON.parse(savedData)
      console.log(`📦 Найдено ${blocks.length} сохранённых блоков`)
      return blocks
    }
  } catch (error) {
    console.error('Ошибка загрузки сохранённых блоков:', error)
  }
  return []
}

// Инициализация BlockBuilder БЕЗ готового UI
const blockBuilder = new BlockBuilder({
  // Не передаем containerId - UI автоматически не инициализируется
  blockConfigs: blockConfigs,
  autoInit: false // Ручная инициализация
})

console.log('✅ BlockBuilder API инициализирован')
console.log('📦 Используется только программный API, без готового UI')

// Загружаем начальные блоки если есть
const initialBlocks = loadSavedBlocks()
for (const block of initialBlocks) {
  await blockBuilder.createBlock(block)
}

// Элементы DOM
const elements = {
  // Текстовые блоки
  addTextBtn: document.getElementById('addTextBlock'),
  addImageBtn: document.getElementById('addImageBlock'),
  addCardBtn: document.getElementById('addCardBlock'),
  addHeroBtn: document.getElementById('addHeroBlock'),

  // Операции с блоками
  getAllBlocksBtn: document.getElementById('getAllBlocks'),
  getBlocksCountBtn: document.getElementById('getBlocksCount'),
  getBlocksByTypeBtn: document.getElementById('getBlocksByType'),
  clearBlocksBtn: document.getElementById('clearBlocks'),

  // Экспорт/импорт
  exportBtn: document.getElementById('exportBlocks'),
  importBtn: document.getElementById('importBlocks'),
  downloadBtn: document.getElementById('downloadBlocks'),
  uploadBtn: document.getElementById('uploadBtn'),
  uploadInput: document.getElementById('uploadInput'),

  // Блокировка и видимость
  toggleLockBtn: document.getElementById('toggleBlockLock'),
  toggleVisibilityBtn: document.getElementById('toggleBlockVisibility'),

  // Реорганизация
  reorderBtn: document.getElementById('reorderBlocks'),

  // Компоненты
  registerComponentBtn: document.getElementById('registerComponent'),
  getAllComponentsBtn: document.getElementById('getAllComponents'),

  // Кастомные поля
  registerCustomFieldBtn: document.getElementById('registerCustomField'),
  getAllCustomFieldsBtn: document.getElementById('getAllCustomFields'),

  // Конфигурации
  getBlockConfigsBtn: document.getElementById('getBlockConfigs'),
  getAvailableBlockTypesBtn: document.getElementById('getAvailableBlockTypes'),

  // Отображение
  blocksJsonEl: document.getElementById('blocksJson'),
  blocksContainerEl: document.getElementById('blocksContainer'),
  infoPanel: document.getElementById('infoPanel')
}

// Счетчик для уникальных ID
let blockCounter = 0

// Создание ID блока
function generateBlockId() {
  blockCounter++
  return `block-${Date.now()}-${blockCounter}`
}

// Логирование информации
function logInfo(message, data = null) {
  const infoEl = elements.infoPanel
  const timestamp = new Date().toLocaleTimeString()
  const logEntry = document.createElement('div')
  logEntry.className = 'log-entry'
  logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`
  if (data) {
    logEntry.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`
  }
  infoEl.insertBefore(logEntry, infoEl.firstChild)
  console.log(`[${timestamp}]`, message, data || '')
}

// ===== ФУНКЦИИ ДЛЯ ОТОБРАЖЕНИЯ =====

async function updateDisplay() {
  const blocks = await blockBuilder.getAllBlocks()

  elements.blocksJsonEl.textContent = JSON.stringify(blocks, null, 2)

  elements.blocksContainerEl.innerHTML = blocks.length === 0
    ? '<p style="color: #999; text-align: center; padding: 2rem;">Блоков пока нет</p>'
    : ''

  blocks.forEach((block, index) => {
    const blockEl = document.createElement('div')
    blockEl.className = 'block-item'
    blockEl.innerHTML = `
      <div class="block-header">
        <div class="block-info">
          <strong>#${index + 1} - ${block.type}</strong>
          <small>ID: ${block.id}</small>
        </div>
        <div class="block-meta">
          <span class="meta-item ${block.locked ? 'locked' : ''}" title="${block.locked ? 'Заблокирован' : 'Разблокирован'}">🔒</span>
          <span class="meta-item ${!block.visible ? 'hidden' : ''}" title="${block.visible ? 'Видимый' : 'Скрытый'}">👁️</span>
        </div>
      </div>
      <div class="block-actions">
        <button class="btn btn-secondary btn-sm" onclick="editBlock('${block.id}')">Изменить</button>
        <button class="btn btn-secondary btn-sm" onclick="duplicateBlock('${block.id}')">Дублировать</button>
        <button class="btn btn-warning btn-sm" onclick="toggleBlockLockAPI('${block.id}')">${block.locked ? '🔓 Разблок.' : '🔒 Заблок.'}</button>
        <button class="btn btn-warning btn-sm" onclick="toggleBlockVisibilityAPI('${block.id}')">${!block.visible ? '👁️ Показать' : '🙈 Скрыть'}</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBlock('${block.id}')">Удалить</button>
      </div>
      <div class="block-preview">
        <small>Props: ${JSON.stringify(block.props).substring(0, 120)}...</small>
      </div>
    `
    elements.blocksContainerEl.appendChild(blockEl)
  })
}

// ===== СОЗДАНИЕ БЛОКОВ =====

elements.addTextBtn.addEventListener('click', async () => {
  const id = generateBlockId()
  const newBlock = await blockBuilder.createBlock({
    type: 'text',
    settings: {},
    props: {
      content: `Текстовый блок #${blockCounter}`,
      fontSize: 16 + Math.floor(Math.random() * 16),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }
  })

  logInfo('✅ Создан текстовый блок', newBlock)
  await updateDisplay()
})

elements.addImageBtn.addEventListener('click', async () => {
  const id = generateBlockId()
  const images = ['/1.jpeg', '/2.jpg', '/3.png', '/qw.jpg', '/bear.jpg', '/Edvard_Grieg.jpg']
  const newBlock = await blockBuilder.createBlock({
    type: 'image',
    settings: {},
    props: {
      src: images[(blockCounter - 1) % images.length],
      alt: `Изображение ${blockCounter}`
    }
  })

  logInfo('✅ Создан блок изображения', newBlock)
  await updateDisplay()
})

elements.addCardBtn.addEventListener('click', async () => {
  const newBlock = await blockBuilder.createBlock({
    type: 'card',
    settings: {},
    props: {
      title: `Карточка #${blockCounter}`,
      description: 'Описание карточки',
      bgColor: '#' + Math.floor(Math.random()*16777215).toString(16),
      borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
      titleColor: '#333333',
      textColor: '#666666'
    }
  })

  logInfo('✅ Создан блок карточки', newBlock)
  await updateDisplay()
})

elements.addHeroBtn.addEventListener('click', async () => {
  const newBlock = await blockBuilder.createBlock({
    type: 'hero',
    settings: {},
    props: {
      title: `Hero секция #${blockCounter}`,
      subtitle: 'Подзаголовок',
      bgImage: `/1.jpeg`,
      titleSize: 48,
      subtitleSize: 20
    }
  })

  logInfo('✅ Создан блок Hero', newBlock)
  await updateDisplay()
})

// ===== ПОЛУЧЕНИЕ БЛОКОВ =====

elements.getAllBlocksBtn.addEventListener('click', async () => {
  const blocks = await blockBuilder.getAllBlocks()
  logInfo(`📦 Получено всех блоков: ${blocks.length}`, blocks)
  alert(`Всего блоков: ${blocks.length}\n\nСмотрите панель логов для деталей`)
})

elements.getBlocksCountBtn.addEventListener('click', async () => {
  const count = await blockBuilder.getBlocksCount()
  logInfo(`📊 Количество блоков: ${count}`)
  alert(`Всего блоков: ${count}`)
})

elements.getBlocksByTypeBtn.addEventListener('click', async () => {
  const types = await blockBuilder.getAvailableBlockTypes()
  const selectedType = prompt(`Введите тип блока:\n${types.join(', ')}`, 'text')

  if (selectedType && await blockBuilder.hasBlockType(selectedType)) {
    const blocks = await blockBuilder.getBlocksByType(selectedType)
    logInfo(`📋 Получено блоков типа '${selectedType}': ${blocks.length}`, blocks)
    alert(`Найдено блоков типа "${selectedType}": ${blocks.length}\n\nСмотрите панель логов`)
  } else {
    alert('Неизвестный тип блока')
  }
})

// ===== БЛОКИРОВКА И ВИДИМОСТЬ =====

window.toggleBlockLockAPI = async (id) => {
  const block = await blockBuilder.getBlock(id)
  if (!block) return

  const newLocked = !block.locked
  await blockBuilder.setBlockLocked(id, newLocked)
  logInfo(`🔒 Блок ${id} ${newLocked ? 'заблокирован' : 'разблокирован'}`)
  await updateDisplay()
}

window.toggleBlockVisibilityAPI = async (id) => {
  const block = await blockBuilder.getBlock(id)
  if (!block) return

  const newVisible = !block.visible
  await blockBuilder.setBlockVisible(id, newVisible)
  logInfo(`👁️ Блок ${id} ${newVisible ? 'показан' : 'скрыт'}`)
  await updateDisplay()
}

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====

window.editBlock = async (id) => {
  const block = await blockBuilder.getBlock(id)
  if (!block) {
    alert('Блок не найден')
    return
  }

  const newContent = prompt('Новое содержимое (JSON):', JSON.stringify(block.props, null, 2))
  if (newContent) {
    try {
      const newProps = JSON.parse(newContent)
      await blockBuilder.updateBlock(id, { props: newProps })
      logInfo(`✏️ Блок ${id} обновлен`)
      await updateDisplay()
    } catch (e) {
      alert('Ошибка парсинга JSON: ' + e.message)
    }
  }
}

window.deleteBlock = async (id) => {
  if (confirm(`Удалить блок ${id}?`)) {
    const result = await blockBuilder.deleteBlock(id)
    logInfo(`🗑️ Блок ${id} удален`, { success: result })
    await updateDisplay()
  }
}

window.duplicateBlock = async (id) => {
  const duplicatedBlock = await blockBuilder.duplicateBlock(id)
  if (duplicatedBlock) {
    logInfo(`📄 Блок ${id} продублирован`, duplicatedBlock)
    await updateDisplay()
  }
}

// ===== РЕОРГАНИЗАЦИЯ =====

elements.reorderBtn.addEventListener('click', async () => {
  const blocks = await blockBuilder.getAllBlocks()
  if (blocks.length === 0) {
    alert('Нет блоков для реорганизации')
    return
  }

  const reversedIds = [...blocks].reverse().map(b => b.id)
  await blockBuilder.reorderBlocks(reversedIds)
  logInfo('🔄 Блоки переупорядочены (обратный порядок)')
  await updateDisplay()
})

// ===== ЭКСПОРТ/ИМПОРТ =====

elements.exportBtn.addEventListener('click', async () => {
  const json = await blockBuilder.exportBlocks()
  logInfo('💾 Экспортированы блоки', JSON.parse(json))
  alert('Экспорт выполнен. Смотрите панель логов')
})

elements.downloadBtn.addEventListener('click', async () => {
  const json = await blockBuilder.exportBlocks()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `blocks-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  logInfo('⬇️ Блоки скачаны как JSON файл')
})

elements.uploadBtn.addEventListener('click', () => {
  elements.uploadInput.click()
})

elements.uploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (event) => {
    try {
      const json = event.target.result
      const success = await blockBuilder.importBlocks(json)

      if (success) {
        logInfo('⬆️ Блоки импортированы из файла')
        await updateDisplay()
        alert('✅ Блоки успешно импортированы')
      } else {
        alert('❌ Ошибка импорта. Проверьте формат файла.')
      }
    } catch (error) {
      alert('❌ Ошибка: ' + error.message)
    }
  }
  reader.readAsText(file)
  // Очищаем input, чтобы можно было загрузить тот же файл снова
  elements.uploadInput.value = ''
})

elements.importBtn.addEventListener('click', async () => {
  const json = prompt('Вставьте JSON блоков:')
  if (json) {
    const success = await blockBuilder.importBlocks(json)
    if (success) {
      logInfo('⬆️ Блоки импортированы из JSON')
      await updateDisplay()
      alert('✅ Блоки успешно импортированы')
    } else {
      alert('❌ Ошибка импорта')
    }
  }
})

// ===== ОЧИСТКА =====

elements.clearBlocksBtn.addEventListener('click', async () => {
  if (confirm('🗑️ Удалить все блоки?')) {
    await blockBuilder.clearAllBlocks()
    logInfo('🗑️ Все блоки удалены')
    await updateDisplay()
  }
})

// ===== РАБОТА С КОМПОНЕНТАМИ =====

elements.registerComponentBtn.addEventListener('click', async () => {
  const name = prompt('Имя компонента:', 'myComponent')
  if (name) {
    const myComponent = {
      name: name,
      template: '<div>Мой кастомный компонент</div>',
      props: {},
      methods: {
        greet: () => alert('Привет из кастомного компонента!')
      }
    }
    blockBuilder.registerComponent(name, myComponent)
    logInfo(`📝 Компонент "${name}" зарегистрирован`, myComponent)
  }
})

elements.getAllComponentsBtn.addEventListener('click', async () => {
  const components = blockBuilder.getAllComponents()
  logInfo('📚 Все компоненты', components)
  alert(`Всего компонентов: ${Object.keys(components).length}\n\nСмотрите панель логов`)
})

// ===== РАБОТА С КАСТОМНЫМИ ПОЛЯМИ =====

elements.registerCustomFieldBtn.addEventListener('click', async () => {
  const id = prompt('ID кастомного поля:', 'my-custom-field')
  if (id) {
    const renderer = {
      id,
      name: 'Мое кастомное поле',
      render: (field, value, onChange) => {
        return document.createElement('input')
      }
    }
    blockBuilder.registerCustomFieldRenderer(renderer)
    logInfo(`🎨 Кастомное поле "${id}" зарегистрировано`, renderer)
  }
})

elements.getAllCustomFieldsBtn.addEventListener('click', async () => {
  const fields = blockBuilder.getAllCustomFieldRenderers()
  logInfo('🎨 Все кастомные поля', Array.from(fields.entries()))
  alert(`Всего кастомных полей: ${fields.size}\n\nСмотрите панель логов`)
})

// ===== КОНФИГУРАЦИИ =====

elements.getBlockConfigsBtn.addEventListener('click', async () => {
  const configs = blockBuilder.getBlockConfigs()
  logInfo('⚙️ Все конфигурации блоков', configs)
  alert(`Всего типов блоков: ${Object.keys(configs).length}\n\nСмотрите панель логов`)
})

elements.getAvailableBlockTypesBtn.addEventListener('click', async () => {
  const types = blockBuilder.getAvailableBlockTypes()
  logInfo('📋 Доступные типы блоков', types)
  alert(`Доступно типов: ${types.length}\n\n${types.join(', ')}\n\nСмотрите панель логов`)
})

// Начальное отображение
await updateDisplay()

// Если блоков нет, добавляем примеры
setTimeout(async () => {
  const blocks = await blockBuilder.getAllBlocks()
  if (blocks.length === 0) {
    logInfo('📝 Добавляю примеры блоков...')
    elements.addTextBtn.click()
    setTimeout(() => elements.addImageBtn.click(), 100)
    setTimeout(() => elements.addCardBtn.click(), 200)
  }
}, 500)
