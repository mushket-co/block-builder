<template>
  <div class="rich-text-block">
    <div
      class="container"
      :style="{
        fontSize: props.fontSize + 'px',
        color: props.textColor,
        padding: props.padding || '20px',
        textAlign: props.textAlign || 'left'
      }"
    >
      <div v-html="props.content" class="rich-text-block__content" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  fontSize: {
    type: Number,
    default: 16
  },
  textColor: {
    type: String,
    default: '#333333'
  },
  textAlign: {
    type: String,
    default: 'left'
  },
  padding: {
    type: String,
    default: '20px'
  }
})
</script>

<style lang="scss" scoped>
.rich-text-block {
  &__content {
    :deep(ul) {
      list-style: disc;
      margin-left: 24px;
      margin-bottom: 16px;
    }

    :deep(ol) {
      padding: 0;
      margin-left: 17px;
      margin-bottom: 16px;

      li::marker {
        font-weight: 700;
      }
    }

    :deep(a) {
      color: #0066cc;
      transition: opacity 0.2s ease;
      text-decoration: underline;

      &:hover {
        opacity: 0.75;
      }
    }

    :deep(p) {
      margin: 8px 0;

      &:last-child {
        margin-bottom: 0;
      }
      &:first-child {
        margin-top: 0;
      }
    }

    :deep(strong) {
      font-weight: 700;
    }

    :deep(em) {
      font-style: italic;
    }

    :deep(u) {
      text-decoration: underline;
    }

    :deep(sup) {
      vertical-align: super;
      font-size: smaller;
    }

    :deep(sub) {
      vertical-align: sub;
      font-size: smaller;
    }
  }
}
</style>

