<template>
  <div class="counter-block">
    <div class="container" :style="containerStyle">
      <div class="counter-block__header">
      <h3 class="counter-block__title" :style="titleStyle">{{ title }}</h3>
      <p v-if="description" class="counter-block__description" :style="descriptionStyle">
        {{ description }}
      </p>
    </div>

    <div class="counter-block__display">
      <div class="counter-block__value" :style="valueStyle">
        {{ count }}
      </div>
    </div>

    <div class="counter-block__controls">
      <button
        class="counter-block__button counter-block__button--decrement"
        :style="buttonStyle"
        @click="decrement"
        :disabled="count <= min"
      >
        <span class="counter-block__button-icon">−</span>
        <span class="counter-block__button-text">{{ decrementText }}</span>
      </button>

      <button
        v-if="showReset"
        class="counter-block__button counter-block__button--reset"
        :style="resetButtonStyle"
        @click="reset"
      >
        <span class="counter-block__button-icon">↻</span>
        <span class="counter-block__button-text">{{ resetText }}</span>
      </button>

      <button
        class="counter-block__button counter-block__button--increment"
        :style="buttonStyle"
        @click="increment"
        :disabled="max !== null && count >= max"
      >
        <span class="counter-block__button-icon">+</span>
        <span class="counter-block__button-text">{{ incrementText }}</span>
      </button>
    </div>

    <div v-if="showProgress && max !== null" class="counter-block__progress">
      <div
        class="counter-block__progress-bar"
        :style="progressBarStyle"
      ></div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Счётчик'
  },
  description: {
    type: String,
    default: ''
  },
  initialValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: null
  },
  step: {
    type: Number,
    default: 1
  },
  showReset: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  incrementText: {
    type: String,
    default: 'Увеличить'
  },
  decrementText: {
    type: String,
    default: 'Уменьшить'
  },
  resetText: {
    type: String,
    default: 'Сбросить'
  },
  backgroundColor: {
    type: String,
    default: '#f5f5f5'
  },
  primaryColor: {
    type: String,
    default: '#007bff'
  },
  textColor: {
    type: String,
    default: '#333333'
  },
  buttonColor: {
    type: String,
    default: '#007bff'
  },
  buttonTextColor: {
    type: String,
    default: '#ffffff'
  },
  titleSize: {
    type: Number,
    default: 24
  },
  valueSize: {
    type: Number,
    default: 48
  },
  borderRadius: {
    type: Number,
    default: 12
  }
})

const count = ref(props.initialValue)

const containerStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  borderRadius: `${props.borderRadius}px`,
  color: props.textColor
}))

const titleStyle = computed(() => ({
  fontSize: `${props.titleSize}px`,
  color: props.textColor
}))

const descriptionStyle = computed(() => ({
  color: props.textColor
}))

const valueStyle = computed(() => ({
  fontSize: `${props.valueSize}px`,
  color: props.primaryColor
}))

const buttonStyle = computed(() => ({
  backgroundColor: props.buttonColor,
  color: props.buttonTextColor,
  borderRadius: `${props.borderRadius / 2}px`
}))

const resetButtonStyle = computed(() => ({
  backgroundColor: '#6c757d',
  color: props.buttonTextColor,
  borderRadius: `${props.borderRadius / 2}px`
}))

const progressBarStyle = computed(() => {
  const progress = props.max !== null ? (count.value / props.max) * 100 : 0
  return {
    width: `${progress}%`,
    backgroundColor: props.primaryColor
  }
})

const increment = () => {
  if (props.max === null || count.value < props.max) {
    count.value += props.step
  }
}

const decrement = () => {
  if (count.value > props.min) {
    count.value -= props.step
  }
}

const reset = () => {
  count.value = props.initialValue
}

// Следим за изменением initialValue
watch(() => props.initialValue, (newValue) => {
  count.value = newValue
})

onMounted(() => {
  console.log('🔢 Counter компонент загружен асинхронно!')
})
</script>

<style scoped>
.counter-block {
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.counter-block .container {
  padding: 32px;
}

.counter-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.counter-block__header {
  text-align: center;
  margin-bottom: 24px;
}

.counter-block__title {
  margin: 0 0 8px 0;
  font-weight: 600;
}

.counter-block__description {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
}

.counter-block__display {
  text-align: center;
  margin: 32px 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.counter-block__value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  animation: countChange 0.3s ease;
}

@keyframes countChange {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.counter-block__controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}

.counter-block__button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 24px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;
}

.counter-block__button:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.counter-block__button:active:not(:disabled) {
  transform: translateY(0);
}

.counter-block__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.counter-block__button-icon {
  font-size: 24px;
  line-height: 1;
}

.counter-block__button-text {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.counter-block__progress {
  margin-top: 24px;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.counter-block__progress-bar {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}
</style>
