<template>
  <div class="timelapse-block">
    <div class="container">
      <h2 v-if="title" class="timelapse-block__title">{{ title }}</h2>

    <div class="timelapse-block__content">
      <!-- Левая панель: список этапов -->
      <div class="timelapse-block__stages">
        <div
          v-for="(stage, index) in computedStages"
          :key="index"
          class="timelapse-block__stage"
          :class="{
            'timelapse-block__stage--active': index === currentStageIndex,
            'timelapse-block__stage--completed': index < currentStageIndex
          }"
        >
          <div class="timelapse-block__stage-number">{{ index + 1 }}</div>
          <div class="timelapse-block__stage-content">
            <div class="timelapse-block__stage-name">{{ stage.name }}</div>
            <div class="timelapse-block__stage-duration">{{ stage.duration }} сек</div>
          </div>
          <div v-if="index < currentStageIndex" class="timelapse-block__stage-check">✓</div>
        </div>
      </div>

      <!-- Правая панель: таймер -->
      <div class="timelapse-block__timer-panel">
        <div class="timelapse-block__timer">
          <div class="timelapse-block__timer-value">{{ formattedTimeLeft }}</div>
          <div class="timelapse-block__timer-label">до следующего этапа</div>
        </div>

        <div v-if="currentStage" class="timelapse-block__current-stage">
          <div class="timelapse-block__current-label">Текущий этап:</div>
          <div class="timelapse-block__current-name">{{ currentStage.name }}</div>
        </div>

        <div class="timelapse-block__progress">
          <div
            class="timelapse-block__progress-bar"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>

        <div class="timelapse-block__controls">
          <button
            v-if="!isRunning && !isCompleted"
            @click="start"
            class="timelapse-block__btn timelapse-block__btn--start"
          >
            {{ currentStageIndex === 0 ? 'Старт' : 'Продолжить' }}
          </button>
          <button
            v-if="isRunning"
            @click="pause"
            class="timelapse-block__btn timelapse-block__btn--pause"
          >
            Пауза
          </button>
          <button
            @click="reset"
            class="timelapse-block__btn timelapse-block__btn--reset"
          >
            Сброс
          </button>
        </div>

        <div v-if="isCompleted" class="timelapse-block__completed">
          🎉 Все этапы завершены!
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimelapseBlock',
  props: {
    title: {
      type: String,
      default: 'Таймлапс'
    },
    stages: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentStageIndex: 0,
      timeLeft: 0,
      isRunning: false,
      isCompleted: false,
      intervalId: null
    }
  },
  computed: {
    computedStages() {
      return this.stages && this.stages.length > 0
        ? this.stages
        : [{ name: 'Нет этапов', duration: 0 }]
    },
    currentStage() {
      return this.computedStages[this.currentStageIndex] || null
    },
    formattedTimeLeft() {
      const minutes = Math.floor(this.timeLeft / 60)
      const seconds = this.timeLeft % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
    progressPercentage() {
      if (!this.currentStage || this.currentStage.duration === 0) return 0
      const elapsed = this.currentStage.duration - this.timeLeft
      return (elapsed / this.currentStage.duration) * 100
    }
  },
  watch: {
    stages: {
      immediate: true,
      handler() {
        this.reset()
      }
    }
  },
  beforeUnmount() {
    this.clearTimer()
  },
  methods: {
    start() {
      if (this.isCompleted) return

      this.isRunning = true

      if (this.timeLeft === 0 && this.currentStage) {
        this.timeLeft = this.currentStage.duration
      }

      this.intervalId = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--
        } else {
          this.moveToNextStage()
        }
      }, 1000)
    },
    pause() {
      this.isRunning = false
      this.clearTimer()
    },
    reset() {
      this.isRunning = false
      this.isCompleted = false
      this.currentStageIndex = 0
      this.timeLeft = this.currentStage ? this.currentStage.duration : 0
      this.clearTimer()
    },
    moveToNextStage() {
      if (this.currentStageIndex < this.computedStages.length - 1) {
        this.currentStageIndex++
        this.timeLeft = this.currentStage.duration
      } else {
        this.isCompleted = true
        this.isRunning = false
        this.clearTimer()
      }
    },
    clearTimer() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
    }
  }
}
</script>

<style scoped>
.timelapse-block {
  background: #f5f5f5;
  border-radius: 12px;
}

.timelapse-block__title {
  margin: 0 0 24px 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  text-align: center;
}

.timelapse-block__content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

/* Левая панель: этапы */
.timelapse-block__stages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timelapse-block__stage {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.timelapse-block__stage--active {
  border-color: #4CAF50;
  background: #f1f8f4;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.timelapse-block__stage--completed {
  border-color: #2196F3;
  background: #e3f2fd;
}

.timelapse-block__stage-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #e0e0e0;
  border-radius: 50%;
  font-weight: 700;
  color: #666;
  flex-shrink: 0;
}

.timelapse-block__stage--active .timelapse-block__stage-number {
  background: #4CAF50;
  color: white;
}

.timelapse-block__stage--completed .timelapse-block__stage-number {
  background: #2196F3;
  color: white;
}

.timelapse-block__stage-content {
  flex: 1;
}

.timelapse-block__stage-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.timelapse-block__stage-duration {
  font-size: 13px;
  color: #666;
}

.timelapse-block__stage-check {
  font-size: 24px;
  color: #2196F3;
  flex-shrink: 0;
}

/* Правая панель: таймер */
.timelapse-block__timer-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.timelapse-block__timer {
  text-align: center;
}

.timelapse-block__timer-value {
  font-size: 64px;
  font-weight: 700;
  color: #4CAF50;
  font-family: 'Courier New', monospace;
  letter-spacing: 4px;
}

.timelapse-block__timer-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.timelapse-block__current-stage {
  text-align: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.timelapse-block__current-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.timelapse-block__current-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.timelapse-block__progress {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.timelapse-block__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  transition: width 1s linear;
}

.timelapse-block__controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.timelapse-block__btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.timelapse-block__btn--start {
  background: #4CAF50;
  color: white;
}

.timelapse-block__btn--start:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.timelapse-block__btn--pause {
  background: #FF9800;
  color: white;
}

.timelapse-block__btn--pause:hover {
  background: #F57C00;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
}

.timelapse-block__btn--reset {
  background: #f44336;
  color: white;
}

.timelapse-block__btn--reset:hover {
  background: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

.timelapse-block__completed {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #4CAF50;
  padding: 20px;
  background: #f1f8f4;
  border-radius: 8px;
}

/* Адаптив */
@media (max-width: 768px) {
  .timelapse-block__content {
    flex-direction: column;
  }

  .timelapse-block__timer-value {
    font-size: 48px;
  }

  .timelapse-block__controls {
    flex-direction: column;
  }

  .timelapse-block__btn {
    width: 100%;
  }
}
</style>

