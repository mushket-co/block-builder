<template>
  <div class="link-block" :style="blockStyle">
    <div class="container">
      <a
        :href="url"
        :target="linkTarget"
        :rel="linkRel"
        class="link-block__link"
        @click="handleClick"
      >
        {{ text }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'Ссылка'
  },
  url: {
    type: String,
    default: '#'
  },
  linkTarget: {
    type: String,
    default: '_self'
  },
  hasBackground: {
    type: Boolean,
    default: false
  },
  backgroundColor: {
    type: String,
    default: '#f0f0f0'
  },
  padding: {
    type: String,
    default: '12px 24px'
  }
})

const linkTarget = computed(() => props.linkTarget)
const linkRel = computed(() => {
  return props.linkTarget === '_blank' ? 'noopener noreferrer' : ''
})

const blockStyle = computed(() => {
  const styles = {}
  if (props.hasBackground) {
    styles.backgroundColor = props.backgroundColor
    styles.padding = props.padding
    styles.borderRadius = '8px'
  }
  return styles
})

const handleClick = (event) => {
  if (!props.url.startsWith('#')) {
    return
  }

  event.preventDefault()
  const blockId = props.url.slice(1)
  const target = document.querySelector(`[data-block-id="${blockId}"]`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.link-block {
  text-align: center;
  margin: 20px 0;
}

.link-block__link {
  color: var(--bb-color-primary);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link-block__link:hover {
  color: var(--bb-color-primary-dark);
  text-decoration: underline;
}

.link-block__link:visited {
  color: var(--bb-color-primary);
}
</style>
