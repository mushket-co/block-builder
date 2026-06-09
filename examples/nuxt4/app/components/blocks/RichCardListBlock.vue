<template>
  <div class="rich-card-list">
    <div class="container">
      <h2
        v-if="sectionTitle"
        class="rich-card-list__title"
        :style="{
          color: titleColor,
          fontSize: titleSize + 'px',
          textAlign: titleAlign
        }"
      >
        {{ sectionTitle }}
      </h2>

      <div
        class="rich-card-list__grid"
        :style="{
          gridTemplateColumns: `repeat(auto-fit, minmax(${cardMinWidth}px, 1fr))`,
          gap: gap + 'px'
        }"
      >
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="rich-card"
        :style="{
          backgroundColor: card.backgroundColor || cardDefaultBg,
          color: card.textColor || cardDefaultTextColor,
          borderRadius: cardBorderRadius + 'px',
          boxShadow: cardShadow
        }"
      >
        <!-- Изображение -->
        <div v-if="card.image || card.imageMobile" class="rich-card__image-wrapper">
          <picture>
            <source
              v-if="card.imageMobile"
              :srcset="getImageUrl(card.imageMobile)"
              media="(max-width: 768px)"
            />
            <img
              :src="getImageUrl(card.image || card.imageMobile)"
              :alt="card.imageAlt || card.title"
              class="rich-card__image"
            />
          </picture>
        </div>

        <!-- Контент -->
        <div class="rich-card__content">
          <!-- Заголовок -->
          <h3 v-if="card.title" class="rich-card__title">
            {{ card.title }}
          </h3>

          <!-- Подзаголовок -->
          <h4 v-if="card.subtitle" class="rich-card__subtitle">
            {{ card.subtitle }}
          </h4>

          <!-- Основной текст -->
          <p v-if="card.text" class="rich-card__text">
            {{ card.text }}
          </p>

          <!-- Детальный текст -->
          <div
            v-if="card.detailedText"
            class="rich-card__detailed-text"
            v-html="card.detailedText"
          />

          <!-- Связанная статья -->
          <div v-if="card.relatedArticle" class="rich-card__related-article">
            <span class="rich-card__related-label">📰 Связанная статья:</span>
            <span class="rich-card__related-value">
              {{
                typeof card.relatedArticle === 'object' && card.relatedArticle !== null
                  ? card.relatedArticle.name || card.relatedArticle.id
                  : card.relatedArticle
              }}
            </span>
          </div>

          <!-- Информация о встрече -->
          <div v-if="card.meetingPlace || card.meetingTime || card.participantsCount" class="rich-card__meeting-info">
            <div v-if="card.meetingPlace" class="rich-card__meeting-item">
              <span class="rich-card__meeting-label">📍 Место:</span>
              <span class="rich-card__meeting-value">{{ card.meetingPlace }}</span>
            </div>
            <div v-if="card.meetingTime" class="rich-card__meeting-item">
              <span class="rich-card__meeting-label">🕐 Время:</span>
              <span class="rich-card__meeting-value">{{ card.meetingTime }}</span>
            </div>
            <div v-if="card.participantsCount" class="rich-card__meeting-item">
              <span class="rich-card__meeting-label">👥 Участников:</span>
              <span class="rich-card__meeting-value">{{ card.participantsCount }}</span>
            </div>
          </div>

          <!-- Кнопка -->
          <a
            v-if="card.link && card.buttonText"
            :href="card.link"
            :target="card.linkTarget || '_self'"
            :rel="card.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
            class="rich-card__button"
            :style="{
              backgroundColor: buttonColor,
              color: buttonTextColor,
              borderRadius: buttonBorderRadius + 'px'
            }"
          >
            {{ card.buttonText }}
          </a>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RichCardListBlock',
  computed: {
    // Преобразуем изображение в URL
    // base64 - всегда строка
    // серверное загрузка - объект с обязательным src
    getImageUrl() {
      return (img) => {
        if (!img) return '';
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img !== null) {
          return img.src || '';
        }
        return '';
      };
    }
  },
  props: {
    // Общие настройки
    sectionTitle: {
      type: String,
      default: ''
    },
    titleColor: {
      type: String,
      default: '#333333'
    },
    titleSize: {
      type: Number,
      default: 32
    },
    titleAlign: {
      type: String,
      default: 'center'
    },

    // Карточки
    cards: {
      type: Array,
      default: () => []
    },

    // Стили карточек
    cardMinWidth: {
      type: Number,
      default: 300
    },
    gap: {
      type: Number,
      default: 24
    },
    cardDefaultBg: {
      type: String,
      default: '#ffffff'
    },
    cardDefaultTextColor: {
      type: String,
      default: '#333333'
    },
    cardBorderRadius: {
      type: Number,
      default: 12
    },
    cardShadow: {
      type: String,
      default: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },

    // Стили кнопок
    buttonColor: {
      type: String,
      default: '#667eea'
    },
    buttonTextColor: {
      type: String,
      default: '#ffffff'
    },
    buttonBorderRadius: {
      type: Number,
      default: 6
    }
  }
}
</script>

<style scoped>
.rich-card-list {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: var(--spacing-padding-top);
  padding-bottom: var(--spacing-padding-bottom);
  border-radius: 12px;
}

.rich-card-list__title {
  margin: 0 0 32px 0;
  font-weight: 700;
  line-height: 1.2;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.rich-card-list__grid {
  display: grid;
  width: 100%;
}

.rich-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.rich-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.rich-card__image-wrapper {
  width: 100%;
  height: 240px;
  overflow: hidden;
}

.rich-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.rich-card:hover .rich-card__image {
  transform: scale(1.05);
}

.rich-card__content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.rich-card__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
}

.rich-card__subtitle {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  opacity: 0.9;
}

.rich-card__text {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.85;
}

.rich-card__detailed-text {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.75;
  margin-top: 8px;
}

.rich-card__detailed-text :deep(p) {
  margin: 0 0 8px 0;
}

.rich-card__detailed-text :deep(p:last-child) {
  margin-bottom: 0;
}

.rich-card__related-article {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 12px;
  background-color: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  margin-top: 12px;
}

.rich-card__related-label {
  font-weight: 600;
  white-space: nowrap;
}

.rich-card__related-value {
  opacity: 0.9;
}

.rich-card__meeting-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  margin-top: 12px;
}

.rich-card__meeting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.rich-card__meeting-label {
  font-weight: 600;
  white-space: nowrap;
}

.rich-card__meeting-value {
  opacity: 0.85;
}

.rich-card__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  margin-top: auto;
  transition: opacity 0.3s ease, transform 0.2s ease;
  cursor: pointer;
  align-self: flex-start;
}

.rich-card__button:hover {
  opacity: 0.9;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .rich-card-list {
    padding: 40px 0;
  }

  .rich-card-list__title {
    margin-bottom: 24px;
  }

  .rich-card__image-wrapper {
    height: 200px;
  }

  .rich-card__content {
    padding: 20px;
    gap: 10px;
  }

  .rich-card__title {
    font-size: 20px;
  }

  .rich-card__subtitle {
    font-size: 16px;
  }

  .rich-card__text {
    font-size: 14px;
  }

  .rich-card__detailed-text {
    font-size: 13px;
  }
}
</style>

