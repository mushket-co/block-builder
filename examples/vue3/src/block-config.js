/**
 * Конфигурация блоков для пользователя
 * Это пример ПРАВИЛЬНОГО использования BlockBuilder с полноценным Vue3 + Vite
 *
 * ✅ Настоящие Vue SFC компоненты (.vue файлы)
 * ✅ Настоящий Swiper из npm пакета
 * ✅ Полноценная сборка с Vite
 * ✅ Все возможности современного фреймворка
 */

import { defineAsyncComponent } from 'vue'

// Импорт настоящих Vue SFC компонентов
import TextBlock from './components/TextBlock.vue'
import ImageBlock from './components/ImageBlock.vue'
import ButtonBlock from './components/ButtonBlock.vue'
import CardListBlock from './components/CardListBlock.vue'
import HeroBlock from './components/HeroBlock.vue'
import FeatureCard from './components/FeatureCard.vue'
import GallerySliderBlock from './components/GallerySliderBlock.vue'
import SpacedContentBlock from './components/SpacedContentBlock.vue'
import RichCardListBlock from './components/RichCardListBlock.vue'
import NewsListBlock from './components/NewsListBlock.vue'
import RichTextBlock from './components/RichTextBlock.vue'
import TimelapseBlock from './components/TimelapseBlock.vue'

// ✅ АСИНХРОННЫЙ импорт компонента (загружается по требованию)
const Counter = defineAsyncComponent(() => import('./components/Counter.vue'))


export const blockConfigs = {
  richText: {
    title: 'Rich Text (с визуальным редактором)',
    icon: '✍️',
    description: 'Блок с визуальным редактором Jodit для форматированного текста',
    render: {
      kind: 'component',
      framework: 'vue',
      component: RichTextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Содержимое',
        type: 'custom', // ✅ Используем кастомный тип поля
        customFieldConfig: {
          rendererId: 'wysiwyg-editor', // ID зарегистрированного рендерера
          options: {
            mode: 'default' // Опции для редактора
          }
        },
        rules: [
          { type: 'required', message: 'Содержимое обязательно' }
        ],
        defaultValue: '<p>Введите ваш текст здесь...</p>'
      },
      {
        field: 'fontSize',
        label: 'Размер шрифта',
        type: 'number',
        rules: [
          { type: 'required', message: 'Размер шрифта обязателен' },
          { type: 'min', value: 12, message: 'Минимальный размер: 12px' },
          { type: 'max', value: 48, message: 'Максимальный размер: 48px' }
        ],
        defaultValue: 16
      },
      {
        field: 'textColor',
        label: 'Цвет текста',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет обязателен' }],
        defaultValue: '#333333'
      },
      {
        field: 'textAlign',
        label: 'Выравнивание',
        type: 'select',
        options: [
          { value: 'left', label: 'По левому краю' },
          { value: 'center', label: 'По центру' },
          { value: 'right', label: 'По правому краю' },
          { value: 'justify', label: 'По ширине' }
        ],
        rules: [{ type: 'required', message: 'Выравнивание обязательно' }],
        defaultValue: 'left'
      }
    ]
  },

  text: {
    title: 'Текстовый блок (простой)',
    icon: '📝',
    description: 'Добавьте текстовый контент на страницу',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        placeholder: 'Введите ваш текст...',
        rules: [
          { type: 'required', message: 'Текст обязателен' },
          { type: 'minLength', value: 1, message: 'Текст не может быть пустым' }
        ],
        defaultValue: ''
      },
      {
        field: 'fontSize',
        label: 'Размер шрифта',
        type: 'number',
        rules: [
          { type: 'required', message: 'Размер шрифта обязателен' },
          { type: 'min', value: 8, message: 'Минимальный размер: 8px' },
          { type: 'max', value: 72, message: 'Максимальный размер: 72px' }
        ],
        defaultValue: 16
      },
      {
        field: 'color',
        label: 'Цвет текста',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет обязателен' }],
        defaultValue: '#333333'
      },
      {
        field: 'textAlign',
        label: 'Выравнивание',
        type: 'select',
        options: [
          { value: 'left', label: 'По левому краю' },
          { value: 'center', label: 'По центру' },
          { value: 'right', label: 'По правому краю' }
        ],
        rules: [{ type: 'required', message: 'Выравнивание обязательно' }],
        defaultValue: 'left'
      }
    ],
    // 🧪 Кастомные брекпоинты для тестирования
    spacingOptions: {
      config: {
        min: 0,
        max: 120,
        step: 8,
        // Кастомные брекпоинты (когда указаны, заменяют дефолтные)
        breakpoints: [
          { name: 'xlarge', label: 'XL (Desktop)', maxWidth: undefined }, // Desktop без ограничения
          { name: 'large', label: 'L (Laptop)', maxWidth: 1440 },
          { name: 'medium', label: 'M (Tablet)', maxWidth: 1024 },
          { name: 'small', label: 'S (Mobile)', maxWidth: 640 }
        ]
      }
    }
  },

  image: {
    title: 'Изображение',
    icon: '🖼️',
    description: 'Добавьте изображение на страницу',
    render: {
      kind: 'component',
      framework: 'vue',
      component: ImageBlock
    },
    fields: [
      {
        field: 'src',
        label: 'URL изображения',
        type: 'text',
        placeholder: 'https://example.com/image.jpg',
        rules: [
          { type: 'required', message: 'URL обязателен' },
          { type: 'url', message: 'Введите корректный URL' }
        ],
        defaultValue: '/1.jpeg'
      },
      {
        field: 'alt',
        label: 'Описание',
        type: 'text',
        placeholder: 'Описание изображения',
        rules: [],
        defaultValue: 'Изображение'
      },
      {
        field: 'borderRadius',
        label: 'Скругление углов',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0' },
          { type: 'max', value: 50, message: 'Максимум: 50' }
        ],
        defaultValue: 8
      }
    ]
  },

  button: {
    title: 'Кнопка',
    icon: '🔘',
    description: 'Добавьте интерактивную кнопку',
    render: {
      kind: 'component',
      framework: 'vue',
      component: ButtonBlock
    },
    fields: [
      {
        field: 'text',
        label: 'Текст кнопки',
        type: 'text',
        placeholder: 'Нажми меня',
        rules: [
          { type: 'required', message: 'Текст кнопки обязателен' },
          { type: 'minLength', value: 1, message: 'Текст не может быть пустым' }
        ],
        defaultValue: 'Нажми меня'
      },
      {
        field: 'backgroundColor',
        label: 'Цвет фона',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет обязателен' }],
        defaultValue: '#007bff'
      },
      {
        field: 'color',
        label: 'Цвет текста',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет текста обязателен' }],
        defaultValue: '#ffffff'
      },
      {
        field: 'borderRadius',
        label: 'Скругление',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0' },
          { type: 'max', value: 50, message: 'Максимум: 50' }
        ],
        defaultValue: 4
      },
      {
        field: 'padding',
        label: 'Отступы',
        type: 'text',
        placeholder: '8px 16px',
        rules: [{ type: 'required', message: 'Отступы обязательны' }],
        defaultValue: '8px 16px'
      }
    ]
  },

  hero: {
    title: 'Hero секция',
    icon: '🎯',
    description: 'Главная секция с заголовком и призывом к действию',
    render: {
      kind: 'component',
      framework: 'vue',
      component: HeroBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        placeholder: 'Добро пожаловать',
        rules: [{ type: 'required', message: 'Заголовок обязателен' }],
        defaultValue: 'Добро пожаловать'
      },
      {
        field: 'subtitle',
        label: 'Подзаголовок',
        type: 'textarea',
        placeholder: 'Создайте что-то удивительное',
        rules: [],
        defaultValue: 'Создайте что-то удивительное'
      },
      {
        field: 'backgroundColor',
        label: 'Основной цвет фона',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет обязателен' }],
        defaultValue: '#667eea'
      },
      {
        field: 'accentColor',
        label: 'Акцентный цвет',
        type: 'color',
        rules: [{ type: 'required', message: 'Акцентный цвет обязателен' }],
        defaultValue: '#764ba2'
      },
      {
        field: 'textColor',
        label: 'Цвет текста',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет текста обязателен' }],
        defaultValue: '#ffffff'
      },
      {
        field: 'titleSize',
        label: 'Размер заголовка',
        type: 'number',
        rules: [
          { type: 'min', value: 20, message: 'Минимум: 20px' },
          { type: 'max', value: 100, message: 'Максимум: 100px' }
        ],
        defaultValue: 48
      },
      {
        field: 'subtitleSize',
        label: 'Размер подзаголовка',
        type: 'number',
        rules: [
          { type: 'min', value: 12, message: 'Минимум: 12px' },
          { type: 'max', value: 40, message: 'Максимум: 40px' }
        ],
        defaultValue: 20
      },
      {
        field: 'showButton',
        label: 'Показать кнопку',
        type: 'checkbox',
        rules: [],
        defaultValue: true
      },
      {
        field: 'buttonText',
        label: 'Текст кнопки',
        type: 'text',
        placeholder: 'Начать',
        rules: [],
        defaultValue: 'Начать'
      },
      {
        field: 'buttonColor',
        label: 'Цвет кнопки',
        type: 'color',
        rules: [],
        defaultValue: '#ffffff'
      },
      {
        field: 'buttonTextColor',
        label: 'Цвет текста кнопки',
        type: 'color',
        rules: [],
        defaultValue: '#333333'
      },
      {
        field: 'showDecorations',
        label: 'Показать декорации',
        type: 'checkbox',
        rules: [],
        defaultValue: true
      }
    ],
    // Пример использования padding для блока с фоном
    spacingOptions: {
      spacingTypes: ['padding-top', 'padding-bottom', 'margin-bottom'],
      config: {
        min: 0,
        max: 200,
        step: 10
      }
    }
  },

  cardList: {
    title: 'Список карточек',
    icon: '🃏',
    description: 'Сетка из карточек с изображениями и описаниями',
    render: {
      kind: 'component',
      framework: 'vue',
      component: CardListBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок секции',
        type: 'text',
        placeholder: 'Наши услуги',
        rules: [],
        defaultValue: 'Наши услуги'
      },
      // ✅ НОВЫЙ подход: массив карточек через repeater
      {
        field: 'cards',
        label: 'Карточки',
        type: 'repeater',
        // rules: [
        //   { type: 'required', message: 'Необходима хотя бы одна карточка' }
        // ],
        defaultValue: [
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
        ],
        repeaterConfig: {
          itemTitle: 'Карточка',
          addButtonText: 'Добавить карточку',
          removeButtonText: 'Удалить',
          min: 1, // ⚠️ ИГНОРИРУЕТСЯ! т.к. нет required в rules (можно удалить все)
          max: 12,
          collapsible: true,
          fields: [
            {
              field: 'title',
              label: 'Заголовок',
              type: 'text',
              placeholder: 'Заголовок карточки',
              rules: [{ type: 'required', message: 'Заголовок обязателен' }],
              defaultValue: ''
            },
            {
              field: 'text',
              label: 'Описание',
              type: 'textarea',
              placeholder: 'Описание карточки',
              rules: [{ type: 'required', message: 'Описание обязательно' }],
              defaultValue: ''
            },
            {
              field: 'image',
              label: 'Изображение (URL)',
              type: 'text',
              placeholder: '/путь/к/изображению.jpg',
              rules: [],
              defaultValue: '/2.jpg'
            },
            {
              field: 'button',
              label: 'Текст кнопки',
              type: 'text',
              placeholder: 'Подробнее',
              rules: [],
              defaultValue: 'Подробнее'
            },
            {
              field: 'link',
              label: 'Ссылка',
              type: 'text',
              placeholder: 'https://example.com',
              rules: [],
              defaultValue: 'https://example.com'
            }
          ]
        }
      },
      // Настройки отображения
      {
        field: 'cardBackground',
        label: 'Цвет фона карточек',
        type: 'color',
        rules: [],
        defaultValue: '#ffffff'
      },
      {
        field: 'cardTextColor',
        label: 'Цвет текста карточек',
        type: 'color',
        rules: [],
        defaultValue: '#333333'
      },
      {
        field: 'cardBorderRadius',
        label: 'Скругление карточек',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0' },
          { type: 'max', value: 50, message: 'Максимум: 50' }
        ],
        defaultValue: 8
      },
      {
        field: 'columns',
        label: 'Количество колонок',
        type: 'select',
        options: [
          { value: '1', label: '1 колонка' },
          { value: '2', label: '2 колонки' },
          { value: '3', label: '3 колонки' },
          { value: '4', label: '4 колонки' }
        ],
        rules: [],
        defaultValue: '3'
      },
      {
        field: 'gap',
        label: 'Расстояние между карточками',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0' },
          { type: 'max', value: 100, message: 'Максимум: 100' }
        ],
        defaultValue: 16
      }
    ]
  },

  feature: {
    title: 'Карточка возможности',
    icon: '⭐',
    description: 'Карточка для описания фичи или преимущества',
    render: {
      kind: 'component',
      framework: 'vue',
      component: FeatureCard
    },
    fields: [
      {
        field: 'icon',
        label: 'Иконка (emoji)',
        type: 'text',
        placeholder: '🚀',
        rules: [],
        defaultValue: '🚀'
      },
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        placeholder: 'Быстрая работа',
        rules: [{ type: 'required', message: 'Заголовок обязателен' }],
        defaultValue: 'Быстрая работа'
      },
      {
        field: 'description',
        label: 'Описание',
        type: 'textarea',
        placeholder: 'Молниеносная скорость загрузки...',
        rules: [{ type: 'required', message: 'Описание обязательно' }],
        defaultValue: 'Молниеносная скорость загрузки и отличная производительность'
      }
    ],
    // Демонстрация использования padding для карточки с фоном
    spacingOptions: {
      spacingTypes: ['padding-top', 'padding-bottom', 'margin-bottom'],
      config: {
        min: 0,
        max: 100,
        step: 5
      }
    }
  },

  gallerySlider: {
    title: 'Слайдер галереи',
    icon: '🎠',
    description: '✅ НАСТОЯЩИЙ Swiper из npm пакета! (только с полноценной сборкой)',
    render: {
      kind: 'component',
      framework: 'vue',
      component: GallerySliderBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок галереи',
        type: 'text',
        placeholder: 'Галерея изображений',
        rules: [],
        defaultValue: 'Галерея изображений'
      },
      // ✅ НОВЫЙ подход: массив слайдов через repeater
      {
        field: 'slides',
        label: 'Слайды',
        type: 'repeater',
        rules: [
          { type: 'required', message: 'Необходим хотя бы один слайд' }
        ],
        defaultValue: [
          {
            url: '/2.jpg',
            title: 'Изображение 1',
            description: 'Описание первого изображения'
          },
          {
            url: '/spanch.jpg',
            title: 'Изображение 2',
            description: 'Описание второго изображения'
          },
          {
            url: '/bear.jpg',
            title: 'Изображение 3',
            description: 'Описание третьего изображения'
          },
          {
            url: '/3.png',
            title: 'Изображение 4',
            description: 'Описание четвёртого изображения'
          }
        ],
        repeaterConfig: {
          itemTitle: 'Слайд',
          addButtonText: 'Добавить слайд',
          removeButtonText: 'Удалить',
          min: 2, // ✅ РАБОТАЕТ! т.к. есть required в rules (минимум 2 слайда)
          max: 20,
          collapsible: true,
          fields: [
            {
              field: 'url',
              label: 'URL изображения',
              type: 'text',
              placeholder: '/путь/к/изображению.jpg',
              rules: [{ type: 'required', message: 'URL обязателен' }],
              defaultValue: ''
            },
            {
              field: 'title',
              label: 'Заголовок',
              type: 'text',
              placeholder: 'Заголовок слайда',
              rules: [{ type: 'required', message: 'Заголовок обязателен' }],
              defaultValue: ''
            },
            {
              field: 'description',
              label: 'Описание',
              type: 'textarea',
              placeholder: 'Описание слайда',
              rules: [],
              defaultValue: ''
            }
          ]
        }
      },
      // Настройки слайдера
      {
        field: 'autoplay',
        label: 'Автопрокрутка',
        type: 'checkbox',
        rules: [],
        defaultValue: true
      },
      {
        field: 'autoplayDelay',
        label: 'Задержка (мс)',
        type: 'number',
        rules: [
          { type: 'min', value: 1000, message: 'Минимум: 1000мс' },
          { type: 'max', value: 10000, message: 'Максимум: 10000мс' }
        ],
        defaultValue: 3000
      },
      {
        field: 'loop',
        label: 'Зациклить',
        type: 'checkbox',
        rules: [],
        defaultValue: true
      },
      {
        field: 'spaceBetween',
        label: 'Расстояние между слайдами',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0' },
          { type: 'max', value: 100, message: 'Максимум: 100' }
        ],
        defaultValue: 30
      }
    ]
  },

  counter: {
    title: 'Счётчик',
    icon: '🔢',
    description: '✅ АСИНХРОННЫЙ компонент! Загружается только при использовании',
    render: {
      kind: 'component',
      framework: 'vue',
      component: Counter
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        placeholder: 'Счётчик',
        rules: [{ type: 'required', message: 'Заголовок обязателен' }],
        defaultValue: 'Счётчик'
      },
      {
        field: 'description',
        label: 'Описание',
        type: 'textarea',
        placeholder: 'Описание счётчика',
        rules: [],
        defaultValue: 'Интерактивный счётчик с настройками'
      },
      {
        field: 'initialValue',
        label: 'Начальное значение',
        type: 'number',
        rules: [{ type: 'required', message: 'Начальное значение обязательно' }],
        defaultValue: 0
      },
      {
        field: 'min',
        label: 'Минимальное значение',
        type: 'number',
        rules: [{ type: 'required', message: 'Минимум обязателен' }],
        defaultValue: 0
      },
      {
        field: 'max',
        label: 'Максимальное значение (0 = без ограничений)',
        type: 'number',
        rules: [],
        defaultValue: 100
      },
      {
        field: 'step',
        label: 'Шаг изменения',
        type: 'number',
        rules: [
          { type: 'required', message: 'Шаг обязателен' },
          { type: 'min', value: 1, message: 'Минимум: 1' }
        ],
        defaultValue: 1
      },
      {
        field: 'showReset',
        label: 'Показать кнопку сброса',
        type: 'checkbox',
        rules: [],
        defaultValue: true
      },
      {
        field: 'showProgress',
        label: 'Показать прогресс-бар',
        type: 'checkbox',
        rules: [],
        defaultValue: true
      },
      {
        field: 'incrementText',
        label: 'Текст кнопки увеличения',
        type: 'text',
        rules: [],
        defaultValue: 'Увеличить'
      },
      {
        field: 'decrementText',
        label: 'Текст кнопки уменьшения',
        type: 'text',
        rules: [],
        defaultValue: 'Уменьшить'
      },
      {
        field: 'resetText',
        label: 'Текст кнопки сброса',
        type: 'text',
        rules: [],
        defaultValue: 'Сбросить'
      },
      {
        field: 'backgroundColor',
        label: 'Цвет фона',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет фона обязателен' }],
        defaultValue: '#f5f5f5'
      },
      {
        field: 'primaryColor',
        label: 'Основной цвет',
        type: 'color',
        rules: [{ type: 'required', message: 'Основной цвет обязателен' }],
        defaultValue: '#007bff'
      },
      {
        field: 'textColor',
        label: 'Цвет текста',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет текста обязателен' }],
        defaultValue: '#333333'
      },
      {
        field: 'buttonColor',
        label: 'Цвет кнопок',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет кнопок обязателен' }],
        defaultValue: '#007bff'
      },
      {
        field: 'buttonTextColor',
        label: 'Цвет текста кнопок',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет текста кнопок обязателен' }],
        defaultValue: '#ffffff'
      },
      {
        field: 'titleSize',
        label: 'Размер заголовка',
        type: 'number',
        rules: [
          { type: 'min', value: 12, message: 'Минимум: 12px' },
          { type: 'max', value: 48, message: 'Максимум: 48px' }
        ],
        defaultValue: 24
      },
      {
        field: 'valueSize',
        label: 'Размер значения',
        type: 'number',
        rules: [
          { type: 'min', value: 24, message: 'Минимум: 24px' },
          { type: 'max', value: 96, message: 'Максимум: 96px' }
        ],
        defaultValue: 48
      },
      {
        field: 'borderRadius',
        label: 'Скругление углов',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0' },
          { type: 'max', value: 50, message: 'Максимум: 50' }
        ],
        defaultValue: 12
      }
    ]
  },

  // 🆕 ПРИМЕР: Блок с ЯВНЫМ spacing полем (не автоматическим)
  spacedContent: {
    title: 'Контент с отступами (ручной)',
    icon: '📐',
    description: 'Блок с явно определённым spacing полем',
    render: {
      kind: 'component',
      framework: 'vue',
      component: SpacedContentBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        placeholder: 'Введите заголовок...',
        rules: [
          { type: 'required', message: 'Заголовок обязателен' }
        ],
        defaultValue: 'Заголовок секции'
      },
      {
        field: 'content',
        label: 'Контент',
        type: 'textarea',
        placeholder: 'Введите контент...',
        rules: [
          { type: 'required', message: 'Контент обязателен' }
        ],
        defaultValue: '<p>Это пример контента с настраиваемыми отступами.</p><p>Отступы можно настроить отдельно для каждого брекпоинта.</p>'
      },
      {
        field: 'backgroundColor',
        label: 'Цвет фона',
        type: 'color',
        rules: [],
        defaultValue: '#f8f9fa'
      }
      // Spacing поле теперь генерируется автоматически из spacingOptions ниже
      // Явные поля с type: 'spacing' игнорируются - все настройки в spacingOptions
    ],
    spacingOptions: {
      enabled: true, // По умолчанию true, можно отключить установив false
      // Какие типы отступов доступны (по умолчанию все 4)
      spacingTypes: ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom'],
      config: {
        min: 0,
        max: 120,
        step: 8,
        // Кастомные брекпоинты (когда указаны, заменяют дефолтные)
        breakpoints: [
          { name: 'xlarge', label: 'XL (Desktop)', maxWidth: undefined }, // Desktop без ограничения
          { name: 'large', label: 'L (Laptop)', maxWidth: 1440 },
          { name: 'medium', label: 'M (Tablet)', maxWidth: 1024 },
          { name: 'small', label: 'S (Mobile)', maxWidth: 640 }
        ]
      }
    }
  },

  richCardList: {
    title: '🎯 Богатые карточки (тест)',
    icon: '💎',
    description: 'Тестовый блок с множеством полей в каждой карточке',
    render: {
      kind: 'component',
      framework: 'vue',
      component: RichCardListBlock
    },
    fields: [
      {
        field: 'sectionTitle',
        label: 'Заголовок секции',
        type: 'text',
        placeholder: 'Наши продукты',
        rules: [],
        defaultValue: 'Наши продукты'
      },
      {
        field: 'titleColor',
        label: 'Цвет заголовка секции',
        type: 'color',
        rules: [],
        defaultValue: '#333333'
      },
      {
        field: 'titleSize',
        label: 'Размер заголовка секции (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 16, message: 'Минимум: 16px' },
          { type: 'max', value: 72, message: 'Максимум: 72px' }
        ],
        defaultValue: 32
      },
      {
        field: 'titleAlign',
        label: 'Выравнивание заголовка',
        type: 'select',
        options: [
          { value: 'left', label: 'По левому краю' },
          { value: 'center', label: 'По центру' },
          { value: 'right', label: 'По правому краю' }
        ],
        rules: [],
        defaultValue: 'center'
      },

      // Карточки через repeater
      {
        field: 'cards',
        label: 'Карточки',
        type: 'repeater',
        defaultValue: [
          {
            title: 'Премиум продукт',
            subtitle: 'Лучшее решение 2024',
            text: 'Инновационный продукт с передовыми технологиями для вашего бизнеса',
            detailedText: 'Полное описание включает все особенности и преимущества данного продукта. Идеально подходит для малого и среднего бизнеса.',
            link: 'https://example.com/product-1',
            linkTarget: '_blank',
            buttonText: 'Узнать подробнее',
            image: '/1.jpeg',
            imageMobile: '/1.jpeg',
            imageAlt: 'Премиум продукт',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            meetingPlace: 'Конференц-зал "Альфа", БЦ "Столица"',
            meetingTime: '15:00, 25 октября 2024',
            participantsCount: '50'
          },
          {
            title: 'Стандарт версия',
            subtitle: 'Оптимальный выбор',
            text: 'Проверенное решение для ежедневных задач с отличным соотношением цены и качества',
            detailedText: 'Включает базовый функционал, необходимый для эффективной работы. Легко масштабируется при росте вашего бизнеса.',
            link: 'https://example.com/product-2',
            linkTarget: '_self',
            buttonText: 'Подробности',
            image: '/2.jpg',
            imageMobile: '/2.jpg',
            imageAlt: 'Стандарт версия',
            backgroundColor: '#f8f9fa',
            textColor: '#212529',
            meetingPlace: 'Офис компании, 3 этаж',
            meetingTime: '10:30, 26 октября 2024',
            participantsCount: '25'
          },
          {
            title: 'Корпоративное решение',
            subtitle: 'Для крупного бизнеса',
            text: 'Масштабируемое решение с расширенными возможностями для корпоративного уровня',
            detailedText: 'Полная кастомизация, интеграция с существующими системами, приоритетная техническая поддержка 24/7.',
            link: 'https://example.com/product-3',
            linkTarget: '_blank',
            buttonText: 'Связаться с нами',
            image: '/3.png',
            imageMobile: '/3.png',
            imageAlt: 'Корпоративное решение',
            backgroundColor: '#e7f3ff',
            textColor: '#004085',
            meetingPlace: 'Гостиница "Метрополь", зал "Премьер"',
            meetingTime: '14:00, 27 октября 2024',
            participantsCount: '100'
          }
        ],
        repeaterConfig: {
          itemTitle: 'Карточка',
          addButtonText: 'Добавить карточку',
          removeButtonText: 'Удалить',
          min: 2,
          max: 20,
          collapsible: true,
          fields: [
            {
              field: 'title',
              label: 'Заголовок',
              type: 'text',
              placeholder: 'Название продукта',
              rules: [{ type: 'required', message: 'Заголовок обязателен' }],
              defaultValue: ''
            },
            {
              field: 'subtitle',
              label: 'Подзаголовок',
              type: 'text',
              placeholder: 'Краткое описание',
              rules: [],
              defaultValue: ''
            },
            {
              field: 'text',
              label: 'Основной текст',
              type: 'textarea',
              placeholder: 'Основное описание продукта...',
              rules: [{ type: 'required', message: 'Основной текст обязателен' }],
              defaultValue: ''
            },
            {
              field: 'detailedText',
              label: 'Детальное описание',
              type: 'textarea',
              placeholder: 'Подробное описание со всеми деталями...',
              rules: [],
              defaultValue: ''
            },
            {
              field: 'link',
              label: 'Ссылка',
              type: 'text',
              placeholder: 'https://example.com',
              rules: [
                { type: 'required', message: 'Ссылка обязательна' },
                { type: 'pattern', value: '^https?://', message: 'Ссылка должна начинаться с http:// или https://' }
              ],
              defaultValue: 'https://example.com'
            },
            {
              field: 'linkTarget',
              label: 'Открытие ссылки',
              type: 'select',
              options: [
                { value: '_self', label: 'В текущей вкладке' },
                { value: '_blank', label: 'В новой вкладке' }
              ],
              rules: [],
              defaultValue: '_blank'
            },
            {
              field: 'buttonText',
              label: 'Текст кнопки',
              type: 'text',
              placeholder: 'Подробнее',
              rules: [{ type: 'required', message: 'Текст кнопки обязателен' }],
              defaultValue: 'Подробнее'
            },
            {
              field: 'image',
              label: 'Изображение (десктоп)',
              type: 'text',
              placeholder: '/путь/к/изображению.jpg',
              rules: [],
              defaultValue: '/2.jpg'
            },
            {
              field: 'imageMobile',
              label: 'Изображение (мобильное)',
              type: 'text',
              placeholder: '/путь/к/мобильному-изображению.jpg',
              rules: [],
              defaultValue: '/2.jpg'
            },
            {
              field: 'imageAlt',
              label: 'Альтернативный текст изображения',
              type: 'text',
              placeholder: 'Описание изображения для доступности',
              rules: [],
              defaultValue: ''
            },
            {
              field: 'backgroundColor',
              label: 'Цвет фона карточки',
              type: 'color',
              rules: [],
              defaultValue: '#ffffff'
            },
            {
              field: 'textColor',
              label: 'Цвет текста карточки',
              type: 'color',
              rules: [],
              defaultValue: '#333333'
            },
            {
              field: 'meetingPlace',
              label: 'Место встречи',
              type: 'text',
              placeholder: 'Конференц-зал, офис...',
              rules: [{ type: 'required', message: 'Место встречи обязательно' }],
              defaultValue: ''
            },
            {
              field: 'meetingTime',
              label: 'Время встречи',
              type: 'text',
              placeholder: '15:00, 25 октября 2024',
              rules: [{ type: 'required', message: 'Время встречи обязательно' }],
              defaultValue: ''
            },
            {
              field: 'participantsCount',
              label: 'Количество участников',
              type: 'number',
              placeholder: '50',
              rules: [
                { type: 'required', message: 'Количество участников обязательно' },
                { type: 'min', value: 1, message: 'Минимум 1 участник' }
              ],
              defaultValue: ''
            }
          ]
        }
      },

      // Общие настройки отображения
      {
        field: 'cardMinWidth',
        label: 'Минимальная ширина карточки (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 200, message: 'Минимум: 200px' },
          { type: 'max', value: 600, message: 'Максимум: 600px' }
        ],
        defaultValue: 300
      },
      {
        field: 'gap',
        label: 'Отступ между карточками (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0px' },
          { type: 'max', value: 100, message: 'Максимум: 100px' }
        ],
        defaultValue: 24
      },
      {
        field: 'cardDefaultBg',
        label: 'Цвет фона карточек по умолчанию',
        type: 'color',
        rules: [],
        defaultValue: '#ffffff'
      },
      {
        field: 'cardDefaultTextColor',
        label: 'Цвет текста карточек по умолчанию',
        type: 'color',
        rules: [],
        defaultValue: '#333333'
      },
      {
        field: 'cardBorderRadius',
        label: 'Скругление углов карточек (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0px' },
          { type: 'max', value: 50, message: 'Максимум: 50px' }
        ],
        defaultValue: 12
      },
      {
        field: 'cardShadow',
        label: 'Тень карточек',
        type: 'select',
        options: [
          { value: 'none', label: 'Без тени' },
          { value: '0 2px 8px rgba(0, 0, 0, 0.08)', label: 'Легкая' },
          { value: '0 4px 12px rgba(0, 0, 0, 0.1)', label: 'Средняя' },
          { value: '0 8px 24px rgba(0, 0, 0, 0.15)', label: 'Сильная' }
        ],
        rules: [],
        defaultValue: '0 4px 12px rgba(0, 0, 0, 0.1)'
      },
      {
        field: 'buttonColor',
        label: 'Цвет кнопок',
        type: 'color',
        rules: [],
        defaultValue: '#667eea'
      },
      {
        field: 'buttonTextColor',
        label: 'Цвет текста кнопок',
        type: 'color',
        rules: [],
        defaultValue: '#ffffff'
      },
      {
        field: 'buttonBorderRadius',
        label: 'Скругление кнопок (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0px' },
          { type: 'max', value: 50, message: 'Максимум: 50px' }
        ],
        defaultValue: 6
      }
    ],
    spacingOptions: {
      spacingTypes: ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom'],
      config: {
        min: 0,
        max: 120,
        step: 8
      }
    }
  },

  // 🆕 ПРИМЕР: Блок с API Select (работа с внешним API)
  newsList: {
    title: '📰 Список новостей из API',
    icon: '📰',
    description: 'Блок отображения новостей, выбранных через API',
    render: {
      kind: 'component',
      framework: 'vue',
      component: NewsListBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок секции',
        type: 'text',
        placeholder: 'Последние новости',
        rules: [{ type: 'required', message: 'Заголовок обязателен' }],
        defaultValue: 'Последние новости'
      },
      // ✅ ПРИМЕР: API-SELECT с одиночным выбором
      {
        field: 'featuredNewsId',
        label: 'Главная новость',
        type: 'api-select',
        rules: [{ type: 'required', message: 'Выберите главную новость' }],
        defaultValue: null,
        apiSelectConfig: {
          url: 'http://localhost:3001/api/news',
          method: 'GET',
          multiple: false, // Одиночный выбор
          placeholder: 'Начните вводить для поиска новости...',
          searchParam: 'search',
          pageParam: 'page',
          limitParam: 'limit',
          limit: 10,
          debounceMs: 300,
          idField: 'id',
          nameField: 'name',
          minSearchLength: 0,
          loadingText: 'Загрузка новостей...',
          noResultsText: 'Новости не найдены',
          errorText: 'Ошибка загрузки новостей'
        }
      },
      // ✅ ПРИМЕР: API-SELECT с множественным выбором
      {
        field: 'newsIds',
        label: 'Список новостей для отображения',
        type: 'api-select',
        rules: [{ type: 'required', message: 'Выберите хотя бы одну новость' }],
        defaultValue: [],
        apiSelectConfig: {
          url: 'http://localhost:3001/api/news',
          method: 'GET',
          multiple: true, // Множественный выбор
          placeholder: 'Выберите новости...',
          limit: 10,
          debounceMs: 300,
          loadingText: 'Загрузка...',
          noResultsText: 'Ничего не найдено',
          errorText: 'Ошибка загрузки'
        }
      },
      // Настройки отображения
      {
        field: 'showDate',
        label: 'Показывать дату',
        type: 'checkbox',
        rules: [],
        defaultValue: true
      },
      {
        field: 'columns',
        label: 'Количество колонок',
        type: 'select',
        options: [
          { value: '1', label: '1 колонка' },
          { value: '2', label: '2 колонки' },
          { value: '3', label: '3 колонки' }
        ],
        rules: [],
        defaultValue: '2'
      },
      {
        field: 'backgroundColor',
        label: 'Цвет фона',
        type: 'color',
        rules: [],
        defaultValue: '#f8f9fa'
      },
      {
        field: 'textColor',
        label: 'Цвет текста',
        type: 'color',
        rules: [],
        defaultValue: '#333333'
      }
    ],
    spacingOptions: {
      spacingTypes: ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom'],
      config: {
        min: 0,
        max: 100,
        step: 4
      }
    }
  },

  timelapse: {
    title: '⏱️ Таймлапс с этапами',
    icon: '⏱️',
    description: 'Таймер с последовательными этапами и обратным отсчетом',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TimelapseBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        placeholder: 'План мероприятия',
        rules: [{ type: 'required', message: 'Заголовок обязателен' }],
        defaultValue: 'План мероприятия'
      },
      {
        field: 'stages',
        label: 'Этапы',
        type: 'repeater',
        rules: [
          { type: 'required', message: 'Необходим хотя бы один этап' }
        ],
        defaultValue: [
          {
            name: 'Регистрация участников',
            duration: 300
          },
          {
            name: 'Открытие мероприятия',
            duration: 180
          },
          {
            name: 'Основной доклад',
            duration: 600
          },
          {
            name: 'Перерыв',
            duration: 120
          },
          {
            name: 'Вопросы и ответы',
            duration: 300
          }
        ],
        repeaterConfig: {
          itemTitle: 'Этап',
          addButtonText: 'Добавить этап',
          removeButtonText: 'Удалить',
          min: 1,
          max: 20,
          collapsible: true,
          fields: [
            {
              field: 'name',
              label: 'Название этапа',
              type: 'text',
              placeholder: 'Введите название этапа',
              rules: [
                { type: 'required', message: 'Название этапа обязательно' },
                { type: 'minLength', value: 3, message: 'Минимум 3 символа' },
                { type: 'maxLength', value: 100, message: 'Максимум 100 символов' }
              ],
              defaultValue: 'Новый этап'
            },
            {
              field: 'duration',
              label: 'Длительность (секунды)',
              type: 'number',
              placeholder: '60',
              rules: [
                { type: 'required', message: 'Длительность обязательна' },
                { type: 'min', value: 1, message: 'Минимум 1 секунда' },
                { type: 'max', value: 7200, message: 'Максимум 7200 секунд (2 часа)' }
              ],
              defaultValue: 60
            }
          ]
        }
      }
    ]
  }
}

