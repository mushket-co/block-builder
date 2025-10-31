<template>
  <div class="card-list-block">
    <div class="container">
      <h2 v-if="title" class="list-title">{{ title }}</h2>

      <div
        class="cards-container"
        :style="containerStyle"
      >
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="card"
          :style="cardStyle"
          @click="handleCardClick($event, card)"
        >
          <div v-if="card.image" class="card-image">
            <img :src="card.image" :alt="card.title" />
          </div>
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-text">{{ card.text }}</p>
          <span
            v-if="card.button && card.link"
            class="card-button"
          >
            {{ card.button }}
          </span>
        </div>
      </div>
    </div>

    <!-- Модалка с деталями карточки (логика пользователя, НЕ пакета) -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="card-modal-overlay"
        @click="closeModal"
      >
        <div class="card-modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedCard?.title }}</h3>
            <button
              class="close-button"
              @click="closeModal"
            >
              ×
            </button>
          </div>
          <div class="modal-body">
            <img
              v-if="selectedCard?.image"
              :src="selectedCard.image"
              :alt="selectedCard.title"
            />
            <h4>{{ selectedCard?.title }}</h4>
            <p>{{ selectedCard?.text }}</p>
            <div class="modal-actions">
              <button
                v-if="selectedCard?.link"
                class="action-button"
                @click="openLink(selectedCard.link)"
              >
                {{ selectedCard?.button }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Наши услуги' },
  cards: {
    type: Array,
    default: () => [
      {
        title: 'Веб-разработка',
        text: 'Создание современных веб-приложений',
        button: 'Подробнее',
        link: 'https://example.com',
        image: '/2.jpg'
      },
      {
        title: 'Мобильные приложения',
        text: 'Разработка мобильных приложений для iOS и Android',
        button: 'Узнать больше',
        link: 'https://example.com',
        image: '/spanch.jpg'
      },
      {
        title: 'Дизайн',
        text: 'Создание уникального дизайна для вашего бренда',
        button: 'Посмотреть работы',
        link: 'https://example.com',
        image: '/bear.jpg'
      }
    ]
  },
  cardBackground: { type: String, default: '#ffffff' },
  cardTextColor: { type: String, default: '#333333' },
  cardBorderRadius: { type: Number, default: 8 },
  columns: { type: [String, Number], default: '3' },
  gap: { type: Number, default: 16 }
})

const selectedCard = ref(null)
const showModal = ref(false)

const containerStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gap: `${props.gap}px`,
  padding: '20px 0'
}))

const cardStyle = computed(() => ({
  backgroundColor: props.cardBackground,
  color: props.cardTextColor,
  borderRadius: `${props.cardBorderRadius}px`
}))

const handleCardClick = (event, card) => {
  event.preventDefault()
  selectedCard.value = card
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedCard.value = null
}

const openLink = (link) => {
  window.open(link, '_blank')
  closeModal()
}
</script>

<style scoped>
.list-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 30px;
  color: #333;
  font-weight: 700;
}

.card {
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 15px;
}

.card-title {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
}

.card-text {
  margin-bottom: 15px;
  line-height: 1.5;
  opacity: 0.8;
}

.card-button {
  display: inline-block;
  background-color: #007bff;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.card-button:hover {
  background-color: #0056b3;
}

/* Модалка */
.card-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.card-modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(255,255,255,0.2);
}

.modal-body {
  padding: 24px;
}

.modal-body img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.modal-body h4 {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  color: #333;
}

.modal-body p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

.modal-actions {
  text-align: center;
  margin-top: 24px;
}

.action-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79,172,254,0.3);
  transition: all 0.3s;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79,172,254,0.4);
}

.action-button:active {
  transform: translateY(0);
}
</style>

