<template>
  <div class="app-layout">
    <aside class="theme-panel">
      <h1>BlockBuilder theme API</h1>
      <p>
        UI is styled via CSS custom properties on <code>.bb-app</code>.
        Override tokens with the <code>theme</code> preset or <code>theme-vars</code> prop — no
        <code>!important</code> needed.
      </p>

      <div class="theme-options">
        <label
          v-for="option in themeOptions"
          :key="option.id"
          class="theme-option"
          :class="{ 'theme-option--active': selectedTheme === option.id }"
        >
          <input v-model="selectedTheme" type="radio" :value="option.id" hidden />
          <span
            class="theme-swatch"
            :style="
              option.id === 'glass'
                ? { background: 'linear-gradient(135deg, #c084fc 0%, #581c87 100%)' }
                : { background: option.swatch }
            "
          />
          {{ option.label }}
        </label>
      </div>

      <pre class="theme-code">{{ activeSnippet }}</pre>
    </aside>

    <div class="builder-shell" :class="{ 'builder-shell--glass': selectedTheme === 'glass' }">
      <div class="app-content">
        <BlockBuilderComponent
          locale="en"
          :theme="blockBuilderTheme"
          :theme-vars="blockBuilderThemeVars"
          :config="{ availableBlockTypes }"
          :block-management-use-case="blockManagementUseCase"
          :api-select-use-case="apiSelectUseCase"
          :custom-field-renderer-registry="customFieldRendererRegistry"
          :on-save="handleSave"
          :initial-blocks="initialBlocks"
          controls-container-class="container"
          controls-fixed-position="bottom"
          :controls-offset="16"
          :is-edit="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import {
  ApiSelectUseCase,
  BlockBuilderComponent,
  createBlockManagementUseCase,
  CustomFieldRendererRegistry,
  FetchHttpClient,
} from '@mushket-co/block-builder/vue'
import { blockConfigs } from './block-config'
import { createNestedRepeaterDefaultCategory } from '../../shared/nestedRepeaterBlockConfig.js'
import { WysiwygFieldRenderer } from '../../vue3/src/customFieldRenderers/WysiwygFieldRenderer.js'

/** Teal “mint” brand — clearly unlike default purple. */
const BRAND_THEME_VARS = {
  '--bb-color-primary': '#0f766e',
  '--bb-color-primary-dark': '#115e59',
  '--bb-color-primary-light': '#ccfbf1',
  '--bb-color-primary-alpha-10': 'rgba(15, 118, 110, 0.12)',
  '--bb-color-primary-alpha-15': 'rgba(15, 118, 110, 0.18)',
  '--bb-color-primary-alpha-20': 'rgba(15, 118, 110, 0.24)',
  '--bb-color-surface': '#f0fdfa',
  '--bb-color-neutral-1': '#ecfeff',
  '--bb-color-neutral-2': '#cffafe',
  '--bb-color-neutral-3': '#99f6e4',
  '--bb-color-neutral-8': '#134e4a',
  '--bb-color-success': '#059669',
  '--bb-color-secondary': '#64748b',
  '--bb-form-control-height': '44px',
  '--bb-form-control-radius': '10px',
  '--bb-radius-sm': '6px',
  '--bb-radius-md': '10px',
  '--bb-radius-lg': '18px',
  '--bb-font-family': '"Space Grotesk", "IBM Plex Sans", system-ui, sans-serif',
  '--bb-btn-padding-y': '11px',
  '--bb-btn-padding-x': '26px',
  '--bb-shadow-primary': '0 6px 20px rgba(15, 118, 110, 0.35)',
  '--bb-shadow-md': '0 8px 24px rgba(19, 78, 74, 0.14)',
}

/** Frosted glass — dark translucent surfaces + violet accent (refs: TG/iOS sheets). */
const GLASS_THEME_VARS = {
  '--bb-color-primary': '#c084fc',
  '--bb-color-primary-dark': '#a855f7',
  '--bb-color-primary-light': 'rgba(168, 85, 247, 0.2)',
  '--bb-color-primary-alpha-10': 'rgba(168, 85, 247, 0.14)',
  '--bb-color-primary-alpha-15': 'rgba(168, 85, 247, 0.2)',
  '--bb-color-primary-alpha-20': 'rgba(168, 85, 247, 0.26)',
  '--bb-color-surface': 'rgba(32, 34, 42, 0.52)',
  '--bb-color-neutral-1': 'rgba(255, 255, 255, 0.06)',
  '--bb-color-neutral-2': 'rgba(255, 255, 255, 0.1)',
  '--bb-color-neutral-3': 'rgba(255, 255, 255, 0.16)',
  '--bb-color-neutral-4': 'rgba(255, 255, 255, 0.22)',
  '--bb-color-neutral-5': 'rgba(255, 255, 255, 0.45)',
  '--bb-color-neutral-6': 'rgba(255, 255, 255, 0.58)',
  '--bb-color-neutral-7': 'rgba(255, 255, 255, 0.75)',
  '--bb-color-neutral-8': '#f4f4f5',
  '--bb-color-overlay': 'rgba(0, 0, 0, 0.48)',
  '--bb-color-overlay-medium': 'rgba(0, 0, 0, 0.62)',
  '--bb-color-danger-bg': 'rgba(248, 113, 113, 0.16)',
  '--bb-color-danger-light': 'rgba(248, 113, 113, 0.22)',
  '--bb-color-danger-alpha-10': 'rgba(248, 113, 113, 0.2)',
  '--bb-form-control-height': '44px',
  '--bb-form-control-radius': '14px',
  '--bb-radius-sm': '10px',
  '--bb-radius-md': '14px',
  '--bb-radius-lg': '24px',
  '--bb-modal-radius': '28px',
  '--bb-font-family': '"IBM Plex Sans", system-ui, sans-serif',
  '--bb-shadow-md': '0 8px 32px rgba(0, 0, 0, 0.35)',
  '--bb-shadow-lg': '0 24px 48px rgba(0, 0, 0, 0.45)',
}

const themeOptions = [
  { id: 'default', label: 'Default (package tokens)', swatch: '#2d2079' },
  { id: 'dark', label: 'Dark preset (theme="dark")', swatch: '#8ab4f8' },
  { id: 'brand', label: 'Brand overrides (themeVars)', swatch: '#0f766e' },
  { id: 'glass', label: 'Frosted glass (themeVars + blur)', swatch: 'linear-gradient(135deg, #a855f7, #3b0764)' },
]

const selectedTheme = ref('brand')

const blockBuilderTheme = computed(() => {
  if (selectedTheme.value === 'dark') {
    return 'dark'
  }
  return undefined
})

const blockBuilderThemeVars = computed(() => {
  if (selectedTheme.value === 'brand') {
    return BRAND_THEME_VARS
  }
  if (selectedTheme.value === 'glass') {
    return GLASS_THEME_VARS
  }
  return undefined
})

watch(
  selectedTheme,
  theme => {
    document.body.classList.toggle('glass-theme-active', theme === 'glass')
  },
  { immediate: true }
)

onUnmounted(() => {
  document.body.classList.remove('glass-theme-active')
})

const snippets = {
  default: `<BlockBuilderComponent />`,
  dark: `<BlockBuilderComponent theme="dark" />`,
  brand: `<BlockBuilderComponent
  :theme-vars="{
    '--bb-color-primary': '#0f766e',
    '--bb-color-primary-dark': '#115e59',
    '--bb-color-primary-light': '#ccfbf1',
    '--bb-color-surface': '#f0fdfa',
    '--bb-color-neutral-8': '#134e4a',
  }"
/>`,
  glass: `<BlockBuilderComponent
  :theme-vars="{
    '--bb-color-primary': '#c084fc',
    '--bb-color-surface': 'rgba(32, 34, 42, 0.52)',
    '--bb-color-neutral-8': '#f4f4f5',
    '--bb-modal-radius': '28px',
  }"
/>
<!-- + backdrop-filter on surfaces in app CSS -->`,
}

const activeSnippet = computed(() => snippets[selectedTheme.value])

const blockManagementUseCase = createBlockManagementUseCase()
const httpClient = new FetchHttpClient()
const apiSelectUseCase = new ApiSelectUseCase(httpClient)

const customFieldRendererRegistry = new CustomFieldRendererRegistry()
customFieldRendererRegistry.register(new WysiwygFieldRenderer())

const componentRegistry = blockManagementUseCase.getComponentRegistry()

Object.entries(blockConfigs).forEach(([type, config]) => {
  if (config.render?.component) {
    componentRegistry.register(type, config.render.component)
  }
})

const availableBlockTypes = ref(
  Object.entries(blockConfigs).map(([type, cfg]) => ({
    type,
    label: cfg.title,
    icon: cfg.icon,
    render: cfg.render,
    fields: cfg.fields,
    defaultSettings: {},
    defaultProps:
      cfg.fields?.reduce((acc, field) => {
        acc[field.field] = field.defaultValue
        return acc
      }, {}) || {},
  }))
)

const defaultCategory = createNestedRepeaterDefaultCategory('en')

const initialBlocks = ref([
  {
    id: 'theme-demo-text',
    type: 'text',
    visible: true,
    locked: false,
    order: 0,
    render: { kind: 'component', framework: 'vue' },
    props: {
      content:
        'Switch themes in the sidebar. Edit the catalog block below — nested repeaters include every field type.',
      fontSize: 18,
      color: '#334155',
      textAlign: 'left',
    },
  },
  {
    id: 'theme-demo-catalog',
    type: 'nestedRepeater',
    visible: true,
    locked: false,
    order: 1,
    render: { kind: 'component', framework: 'vue' },
    props: {
      title: 'Product catalog',
      description: 'Demo catalog with nested repeaters and full field validation.',
      categories: [defaultCategory],
    },
  },
])

async function handleSave(blocks) {
  console.info('[theme demo] save', blocks)
  return true
}
</script>
