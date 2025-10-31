<template>
  <div class="button-block">
    <div class="container">
      <button
        class="custom-button"
        :style="buttonStyle"
        @click="handleClick"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">{{ text }}</span>
        <span v-else>Загрузка...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  backgroundColor: {
    type: String,
    default: '#007bff'
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  borderRadius: {
    type: Number,
    default: 4
  },
  padding: {
    type: String,
    default: '8px 16px'
  }
})

const isLoading = ref(false)

const buttonStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  color: props.color,
  borderRadius: `${props.borderRadius}px`,
  padding: props.padding,
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '500'
}))

const handleClick = () => {
  isLoading.value = true
  console.log('Кнопка нажата:', props.text)
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}
</script>

<style scoped>
.button-block {
  text-align: center;
  margin: 20px 0;
}

.custom-button {
  transition: all 0.2s ease;
}

.custom-button:hover:not(:disabled) {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.custom-button:active:not(:disabled) {
  transform: scale(0.98);
}

.custom-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

