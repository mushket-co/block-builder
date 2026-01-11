# Использование ToggleControl

`ToggleControl` - это компонент для условного показа/скрытия содержимого формы с помощью переключателя (toggle switch). Он аналогичен `FormEditorToggle` из ref проекта.

## Где находится

- **Компонент**: `block-builder/src/ui/components/ToggleControl.vue`
- **Экспорт**: Компонент доступен для использования в Vue 3 приложениях

## Основное использование (через dependsOn)

**Важно**: В текущей версии block-builder поля с `dependsOn` автоматически скрываются/показываются через `v-show`. `ToggleControl` создан как базовый компонент для будущего улучшения UI, когда checkbox поле и зависимые от него поля будут автоматически группироваться.

### Текущий способ: используйте dependsOn

Самый простой способ - использовать `dependsOn` в конфигурации поля. Block-builder автоматически скроет поле, если условие не выполнено:

```javascript
{
  field: 'autoplay',
  label: 'Автопрокрутка',
  type: 'checkbox',
  defaultValue: true
},
{
  field: 'autoplayDelay',
  label: 'Задержка (мс)',
  type: 'number',
  dependsOn: {
    field: 'autoplay',
    value: true,
    operator: 'equals' // по умолчанию
  }
}
```

**Примеры использования dependsOn:**
- См. `block-builder/examples/vue3/src/block-config.js` - блок `gallerySlider`
- См. `block-builder/examples/pure-js-vite/src/block-config.js` - блок `gallerySlider`

## Ручное использование (через custom field renderer)

Если вам нужно использовать ToggleControl для группировки полей вручную, можно создать custom field renderer:

### 1. Создайте Custom Field Renderer

```javascript
// customFieldRenderers/ToggleGroupRenderer.js
import ToggleControl from '@mushket-co/block-builder/ui/components/ToggleControl.vue'

export class ToggleGroupRenderer {
  async render(container, context) {
    const { createApp } = await import('vue')
    const app = createApp(ToggleControl, {
      modelValue: context.value || false,
      label: context.label,
      'onUpdate:modelValue': (value) => {
        context.onChange(value)
      }
    })

    // Рендерим содержимое в slot body
    // ...

    app.mount(container)
    return { destroy: () => app.unmount() }
  }
}
```

### 2. Используйте в конфигурации блока

```javascript
{
  field: 'titleSettings',
  label: 'Настройки заголовка',
  type: 'custom',
  customFieldConfig: {
    rendererId: 'toggle-group',
    // ...
  }
}
```

## Использование dependsOn (рекомендуемый способ)

**Простой способ** - использовать `dependsOn` в конфигурации поля. Block-builder автоматически скроет поле, если условие не выполнено:

```javascript
{
  field: 'autoplay',
  label: 'Автопрокрутка',
  type: 'checkbox',
  defaultValue: true
},
{
  field: 'autoplayDelay',
  label: 'Задержка (мс)',
  type: 'number',
  dependsOn: {
    field: 'autoplay',
    value: true,
    operator: 'equals' // по умолчанию
  }
}
```

## Примеры

Смотрите примеры в:
- `block-builder/examples/vue3/src/block-config.js` - блок `gallerySlider`
- `block-builder/examples/pure-js-vite/src/block-config.js` - блок `gallerySlider`

## Примечание

Для JS-core версии `dependsOn` работает автоматически через JavaScript, который генерируется в `FormBuilder.generateDependsOnScript()`.
