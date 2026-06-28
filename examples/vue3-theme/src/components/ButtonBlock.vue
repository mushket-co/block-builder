<template>
  <div class="button-block">
    <div class="container">
      <button class="custom-button" :style="buttonStyle" type="button">
        {{ text }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    default: '#007bff',
  },
  color: {
    type: String,
    default: '#ffffff',
  },
  borderRadius: {
    type: Number,
    default: 4,
  },
  padding: {
    type: String,
    default: '8px 16px',
  },
})

const buttonStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  color: props.color,
  borderRadius: `${props.borderRadius}px`,
  padding: props.padding,
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
}))
</script>

<style scoped>
.button-block {
  padding: 16px 0;
  text-align: center;
}
</style>
