/**
 * Конфигурация блоков для пользователя
 * Пример использования BlockBuilder с React + Vite
 */

import { lazy } from 'react'

import ButtonBlock from './components/blocks/ButtonBlock'
import GallerySliderBlock from './components/blocks/GallerySliderBlock'
import ImageBlock from './components/blocks/ImageBlock'
import LinkBlock from './components/blocks/LinkBlock'
import NestedRepeaterBlock from './components/blocks/NestedRepeaterBlock'
import NewsListBlock from './components/blocks/NewsListBlock'
import RichCardListBlock from './components/blocks/RichCardListBlock'
import RichTextBlock from './components/blocks/RichTextBlock'
import TextBlock from './components/blocks/TextBlock'

const CardListBlock = lazy(() => import('./components/blocks/CardListBlock'))


export const blockConfigs = {
  richText: {
    title: 'Rich Text (с визуальным редактором)',
    icon: '/icons/rich-text.svg',
    description: 'Блок с визуальным редактором Jodit для форматированного текста',
    render: {
      kind: 'component',
      framework: 'react',
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
    icon: '/icons/text.svg',
    description: 'Добавьте текстовый контент на страницу',
    render: {
      kind: 'component',
      framework: 'react',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        placeholder: 'Введите ваш текст...',
        rules: [
          { type: 'required', message: 'Текст обязателен' }
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
    icon: '/icons/image.svg',
    description: 'Добавьте изображение на страницу',
    render: {
      kind: 'component',
      framework: 'react',
      component: ImageBlock
    },
    fields: [
      {
        field: 'image',
        label: 'Изображение',
        type: 'image',
        rules: [
          { type: 'required', message: 'Изображение обязательно' }
        ],
        defaultValue: '',

        imageUploadConfig: {
          uploadUrl: '/api/upload',
          fileParamName: 'file',
          maxFileSize: 5 * 1024 * 1024, // 5MB для демо
          responseMapper: (response) => ({
            src: response.url
          })
        }
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

  cardList: {
    title: 'Список карточек',
    icon: '/icons/card.svg',
    description: 'Сетка из карточек с изображениями и описаниями',
    render: {
      kind: 'component',
      framework: 'react',
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
      {
        field: 'cards',
        label: 'Карточки',
        type: 'repeater',
        defaultValue: [
          {
            title: 'Веб-разработка',
            text: 'Создание современных веб-приложений',
            button: 'Подробнее',
            link: 'https://example.com',
            image: ''
          },
          {
            title: 'Мобильные приложения',
            text: 'Разработка мобильных приложений для iOS и Android',
            button: 'Узнать больше',
            link: 'https://example.com',
            image: ''
          },
          {
            title: 'Дизайн',
            text: 'Создание уникального дизайна для вашего бренда',
            button: 'Посмотреть работы',
            link: 'https://example.com',
            image: ''
          }
        ],
        repeaterConfig: {
          itemTitle: 'Карточка',
          countLabelVariants: { one: 'карточка', few: 'карточки', many: 'карточек', zero: 'карточек' },
          addButtonText: 'Добавить карточку',
          removeButtonText: 'Удалить',
          min: 1, // ⚠️ ИГНОРИРУЕТСЯ! т.к. нет required в rules (можно удалить все)
          max: 12,
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
              label: 'Изображение',
              type: 'image',
              rules: [],
              defaultValue: ''
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
              placeholder: '/news/123/ или https://example.com',
              rules: [
                { type: 'required', message: 'Ссылка обязательна' },
                { type: 'minLength', value: 1, message: 'Ссылка не может быть пустой' }
              ],
              defaultValue: ''
            },
            {
              field: 'featuredNews',
              label: 'Связанная новость',
              type: 'api-select',
              rules: [],
              defaultValue: null,
              apiSelectConfig: {
                url: '/api/news',
                searchParam: 'search',
                pageParam: 'page',
                limitParam: 'limit',
                placeholder: 'Выберите новость',
                noResultsText: 'Ничего не найдено',
                loadingText: 'Загрузка...',
                errorText: 'Ошибка загрузки новостей',
                limit: 10
              }
            },
            {
              field: 'customContent',
              label: 'Дополнительное содержимое',
              type: 'custom',
              rules: [],
              defaultValue: '',
              customFieldConfig: {
                rendererId: 'wysiwyg-editor',
                options: {
                  mode: 'simple'
                }
              }
            }
          ]
        }
      },
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

  gallerySlider: {
    title: 'Слайдер галереи',
    icon: '/icons/slider.svg',
    description: '✅ НАСТОЯЩИЙ Swiper из npm пакета! (только с полноценной сборкой)',
    render: {
      kind: 'component',
      framework: 'react',
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
      {
        field: 'slides',
        label: 'Слайды',
        type: 'repeater',
        rules: [
          { type: 'required', message: 'Необходим хотя бы один слайд' }
        ],
        defaultValue: [
          {
            image: '',
            title: 'Изображение 1',
            description: 'Описание первого изображения'
          },
          {
            image: '',
            title: 'Изображение 2',
            description: 'Описание второго изображения'
          },
          {
            image: '',
            title: 'Изображение 3',
            description: 'Описание третьего изображения'
          },
          {
            image: '',
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
          fields: [
            {
              field: 'image',
              label: 'Изображение',
              type: 'image',
              rules: [{ type: 'required', message: 'Изображение обязательно' }],
              defaultValue: '',
              imageUploadConfig: {
                uploadUrl: '/api/upload',
                fileParamName: 'file',
                maxFileSize: 5 * 1024 * 1024, // 5MB для демо
                responseMapper: (response) => ({
                  src: response.url // ОБЯЗАТЕЛЬНО вернуть объект с полем src!
                })
              }
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
            },
            {
              field: 'hasLink',
              label: 'Добавить ссылку',
              type: 'checkbox',
              rules: [],
              defaultValue: false
            },
            {
              field: 'linkUrl',
              label: 'URL ссылки',
              type: 'text',
              placeholder: 'https://example.com',
              rules: [
                { type: 'required', message: 'URL ссылки обязателен' }
              ],
              defaultValue: '',
              dependsOn: {
                field: 'hasLink',
                value: true,
                operator: 'equals'
              }
            },
            {
              field: 'linkOpenInNewTab',
              label: 'Открывать в новой вкладке',
              type: 'checkbox',
              rules: [],
              defaultValue: true,
              dependsOn: {
                field: 'hasLink',
                value: true,
                operator: 'equals'
              }
            },
            {
              field: 'linkText',
              label: 'Текст ссылки',
              type: 'text',
              placeholder: 'Подробнее',
              rules: [
                { type: 'required', message: 'Текст ссылки обязателен' }
              ],
              defaultValue: 'Подробнее',
              dependsOn: {
                field: 'hasLink',
                value: true,
                operator: 'equals'
              }
            }
          ]
        }
      },
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
        defaultValue: 3000,
        // ✅ Пример использования dependsOn: поле показывается только если autoplay === true
        dependsOn: {
          field: 'autoplay',
          value: true,
          operator: 'equals'
        }
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

  richCardList: {
    title: 'Богатые карточки (тест)',
    icon: '/icons/card.svg',
    description: 'Тестовый блок с множеством полей в каждой карточке',
    render: {
      kind: 'component',
      framework: 'react',
      component: RichCardListBlock
    },
    fields: [
      {
        field: 'sectionTitle',
        label: 'Заголовок секции',
        type: 'text',
        placeholder: 'Наши продукты',
        rules: [
          { type: 'required', message: 'Заголовок секции обязателен' },
          { type: 'minLength', value: 3, message: 'Минимальная длина: 3 символа' },
          { type: 'maxLength', value: 100, message: 'Максимальная длина: 100 символов' }
        ],
        defaultValue: 'Наши продукты'
      },
      {
        field: 'titleColor',
        label: 'Цвет заголовка секции',
        type: 'color',
        rules: [{ type: 'required', message: 'Цвет заголовка обязателен' }],
        defaultValue: '#333333'
      },
      {
        field: 'titleSize',
        label: 'Размер заголовка секции (px)',
        type: 'number',
        rules: [
          { type: 'required', message: 'Размер заголовка обязателен' },
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
        rules: [{ type: 'required', message: 'Выравнивание заголовка обязательно' }],
        defaultValue: 'center'
      },

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
            image: '',
            imageMobile: '',
            imageAlt: 'Премиум продукт',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            meetingPlace: 'Конференц-зал "Альфа", БЦ "Столица"',
            meetingTime: '15:00, 25 октября 2024',
            participantsCount: '50',
            relatedArticle: null
          },
          {
            title: 'Стандарт версия',
            subtitle: 'Оптимальный выбор',
            text: 'Проверенное решение для ежедневных задач с отличным соотношением цены и качества',
            detailedText: 'Включает базовый функционал, необходимый для эффективной работы. Легко масштабируется при росте вашего бизнеса.',
            link: 'https://example.com/product-2',
            linkTarget: '_self',
            buttonText: 'Подробности',
            image: '',
            imageMobile: '',
            imageAlt: 'Стандарт версия',
            backgroundColor: '#f8f9fa',
            textColor: '#212529',
            meetingPlace: 'Офис компании, 3 этаж',
            meetingTime: '10:30, 26 октября 2024',
            participantsCount: '25',
            relatedArticle: null
          },
          {
            title: 'Корпоративное решение',
            subtitle: 'Для крупного бизнеса',
            text: 'Масштабируемое решение с расширенными возможностями для корпоративного уровня',
            detailedText: 'Полная кастомизация, интеграция с существующими системами, приоритетная техническая поддержка 24/7.',
            link: 'https://example.com/product-3',
            linkTarget: '_blank',
            buttonText: 'Связаться с нами',
            image: '',
            imageMobile: '',
            imageAlt: 'Корпоративное решение',
            backgroundColor: '#e7f3ff',
            textColor: '#004085',
            meetingPlace: 'Гостиница "Метрополь", зал "Премьер"',
            meetingTime: '14:00, 27 октября 2024',
            participantsCount: '100',
            relatedArticle: null
          }
        ],
        repeaterConfig: {
          itemTitle: 'Карточка',
          addButtonText: 'Добавить карточку',
          removeButtonText: 'Удалить',
          min: 2,
          max: 20,
          fields: [
            {
              field: 'title',
              label: 'Заголовок',
              type: 'text',
              placeholder: 'Название продукта',
              rules: [
                { type: 'required', message: 'Заголовок обязателен' },
                { type: 'minLength', value: 3, message: 'Минимальная длина: 3 символа' },
                { type: 'maxLength', value: 100, message: 'Максимальная длина: 100 символов' }
              ],
              defaultValue: ''
            },
            {
              field: 'subtitle',
              label: 'Подзаголовок',
              type: 'text',
              placeholder: 'Краткое описание',
              rules: [
                { type: 'required', message: 'Подзаголовок обязателен' },
                { type: 'minLength', value: 5, message: 'Минимальная длина: 5 символов' },
                { type: 'maxLength', value: 150, message: 'Максимальная длина: 150 символов' }
              ],
              defaultValue: ''
            },
            {
              field: 'text',
              label: 'Основной текст',
              type: 'textarea',
              placeholder: 'Основное описание продукта...',
              rules: [
                { type: 'required', message: 'Основной текст обязателен' },
                { type: 'minLength', value: 10, message: 'Минимальная длина: 10 символов' },
                { type: 'maxLength', value: 500, message: 'Максимальная длина: 500 символов' }
              ],
              defaultValue: ''
            },
            {
              field: 'detailedText',
              label: 'Детальное описание',
              type: 'custom',
              rules: [
                { type: 'required', message: 'Детальное описание обязательно' },
                { type: 'minLength', value: 20, message: 'Минимальная длина: 20 символов' }
              ],
              defaultValue: '',
              customFieldConfig: {
                rendererId: 'wysiwyg-editor',
                options: {
                  mode: 'default'
                }
              }
            },
            {
              field: 'link',
              label: 'Ссылка',
              type: 'text',
              placeholder: '/news/123/ или https://example.com',
              rules: [
                { type: 'required', message: 'Ссылка обязательна' },
                { type: 'minLength', value: 1, message: 'Ссылка не может быть пустой' }
              ],
              defaultValue: ''
            },
            {
              field: 'linkTarget',
              label: 'Открытие ссылки',
              type: 'select',
              options: [
                { value: '_self', label: 'В текущей вкладке' },
                { value: '_blank', label: 'В новой вкладке' }
              ],
              rules: [{ type: 'required', message: 'Выбор открытия ссылки обязателен' }],
              defaultValue: '_blank'
            },
            {
              field: 'buttonText',
              label: 'Текст кнопки',
              type: 'text',
              placeholder: 'Подробнее',
              rules: [
                { type: 'required', message: 'Текст кнопки обязателен' },
                { type: 'minLength', value: 2, message: 'Минимальная длина: 2 символа' },
                { type: 'maxLength', value: 50, message: 'Максимальная длина: 50 символов' }
              ],
              defaultValue: 'Подробнее'
            },
            {
              field: 'image',
              label: 'Изображение (десктоп)',
              type: 'image',
              rules: [{ type: 'required', message: 'Изображение для десктопа обязательно' }],
              defaultValue: ''
            },
            {
              field: 'imageMobile',
              label: 'Изображение (мобильное)',
              type: 'image',
              rules: [{ type: 'required', message: 'Изображение для мобильного обязательно' }],
              defaultValue: ''
            },
            {
              field: 'imageAlt',
              label: 'Альтернативный текст изображения',
              type: 'text',
              placeholder: 'Описание изображения для доступности',
              rules: [
                { type: 'required', message: 'Альтернативный текст обязателен' },
                { type: 'minLength', value: 3, message: 'Минимальная длина: 3 символа' },
                { type: 'maxLength', value: 200, message: 'Максимальная длина: 200 символов' }
              ],
              defaultValue: ''
            },
            {
              field: 'backgroundColor',
              label: 'Цвет фона карточки',
              type: 'color',
              rules: [{ type: 'required', message: 'Цвет фона обязателен' }],
              defaultValue: '#ffffff'
            },
            {
              field: 'textColor',
              label: 'Цвет текста карточки',
              type: 'color',
              rules: [{ type: 'required', message: 'Цвет текста обязателен' }],
              defaultValue: '#333333'
            },
            {
              field: 'meetingPlace',
              label: 'Место встречи',
              type: 'text',
              placeholder: 'Конференц-зал, офис...',
              rules: [
                { type: 'required', message: 'Место встречи обязательно' },
                { type: 'minLength', value: 5, message: 'Минимальная длина: 5 символов' },
                { type: 'maxLength', value: 200, message: 'Максимальная длина: 200 символов' }
              ],
              defaultValue: ''
            },
            {
              field: 'meetingTime',
              label: 'Время встречи',
              type: 'text',
              placeholder: '15:00, 25 октября 2024',
              rules: [
                { type: 'required', message: 'Время встречи обязательно' },
                { type: 'minLength', value: 5, message: 'Минимальная длина: 5 символов' },
                { type: 'maxLength', value: 100, message: 'Максимальная длина: 100 символов' }
              ],
              defaultValue: ''
            },
            {
              field: 'participantsCount',
              label: 'Количество участников',
              type: 'number',
              placeholder: '50',
              rules: [
                { type: 'required', message: 'Количество участников обязательно' },
                { type: 'min', value: 1, message: 'Минимум 1 участник' },
                { type: 'max', value: 10000, message: 'Максимум 10000 участников' }
              ],
              defaultValue: ''
            },
            {
              field: 'relatedArticle',
              label: 'Связанная статья',
              type: 'api-select',
              rules: [{ type: 'required', message: 'Связанная статья обязательна' }],
              defaultValue: null,
              apiSelectConfig: {
                url: '/api/articles',
                searchParam: 'search',
                pageParam: 'page',
                limitParam: 'limit',
                placeholder: 'Выберите статью',
                noResultsText: 'Статьи не найдены',
                loadingText: 'Загрузка статей...',
                errorText: 'Ошибка загрузки статей',
                limit: 10,
                multiple: false
              }
            },
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

  newsList: {
    title: 'Список новостей из API',
    icon: '/icons/text.svg',
    description: 'Блок отображения новостей, выбранных через API',
    render: {
      kind: 'component',
      framework: 'react',
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
          url: '/api/news',
          method: 'GET',
          multiple: false, // Одиночный выбор
          placeholder: 'Начните вводить для поиска новости...',
          searchParam: 'search',
          pageParam: 'page',
          limitParam: 'limit',
          limit: 10,
          debounceMs: 1500,
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
          url: '/api/news',
          method: 'GET',
          multiple: true, // Множественный выбор
          placeholder: 'Выберите новости...',
          limit: 10,
          debounceMs: 1500,
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

  link: {
    title: 'Блок ссылки',
    icon: '/icons/button.svg',
    description: 'Блок с ссылкой, выбором открытия и фоном',
    render: {
      kind: 'component',
      framework: 'react',
      component: LinkBlock
    },
    fields: [
      {
        field: 'text',
        label: 'Текст ссылки',
        type: 'text',
        placeholder: 'Введите текст ссылки',
        rules: [
          { type: 'required', message: 'Текст ссылки обязателен' }
        ],
        defaultValue: 'Перейти'
      },
      {
        field: 'url',
        label: 'URL',
        type: 'text',
        placeholder: '/news/123/ или https://example.com',
        rules: [
          { type: 'required', message: 'URL обязателен' },
          { type: 'minLength', value: 1, message: 'Ссылка не может быть пустой' }
        ],
        defaultValue: ''
      },
      {
        field: 'linkTarget',
        label: 'Как открывать ссылку',
        type: 'radio',
        options: [
          { value: '_self', label: 'В текущей вкладке' },
          { value: '_blank', label: 'В новой вкладке' }
        ],
        rules: [
          { type: 'required', message: 'Выберите способ открытия' }
        ],
        defaultValue: '_self'
      },
      {
        field: 'hasBackground',
        label: 'Добавить фон блока',
        type: 'checkbox',
        defaultValue: false
      },
      {
        field: 'backgroundColor',
        label: 'Цвет фона',
        type: 'color',
        defaultValue: '#f0f0f0',
        dependsOn: {
          field: 'hasBackground',
          value: true,
          operator: 'equals',
        },
      }
    ]
  },

  nestedRepeater: {
    title: 'Каталог с вложенными репитерами',
    icon: '/icons/card.svg',
    description: 'Демонстрация вложенных репитеров: категории (1-й уровень) → товары (2-й уровень)',
    render: {
      kind: 'component',
      framework: 'react',
      component: NestedRepeaterBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок каталога',
        type: 'text',
        placeholder: 'Каталог товаров',
        rules: [],
        defaultValue: 'Каталог товаров'
      },
      {
        field: 'description',
        label: 'Описание каталога',
        type: 'textarea',
        placeholder: 'Описание каталога товаров',
        rules: [],
        defaultValue: ''
      },
      {
        field: 'categories',
        label: 'Категории',
        type: 'repeater',
        rules: [
          { type: 'required', message: 'Необходима хотя бы одна категория' }
        ],
        defaultValue: [
          {
            name: 'Электроника',
            description: 'Современные гаджеты и устройства',
            products: [
              {
                name: 'Смартфон',
                description: 'Современный смартфон с отличной камерой',
                price: 29999,
                image: ''
              },
              {
                name: 'Ноутбук',
                description: 'Мощный ноутбук для работы и игр',
                price: 59999,
                image: ''
              }
            ]
          }
        ],
        repeaterConfig: {
          itemTitle: 'Категория',
          addButtonText: 'Добавить категорию',
          removeButtonText: 'Удалить категорию',
          min: 1,
          max: 10,
          maxNestingDepth: 2,
          fields: [
            {
              field: 'name',
              label: 'Название категории',
              type: 'text',
              placeholder: 'Название категории',
              rules: [
                { type: 'required', message: 'Название категории обязательно' },
                { type: 'minLength', value: 2, message: 'Минимум 2 символа' }
              ],
              defaultValue: ''
            },
            {
              field: 'description',
              label: 'Описание категории',
              type: 'textarea',
              placeholder: 'Описание категории',
              rules: [],
              defaultValue: ''
            },
            {
              field: 'products',
              label: 'Товары',
              type: 'repeater',
              rules: [
                { type: 'required', message: 'Необходим хотя бы один товар' }
              ],
              defaultValue: [],
              repeaterConfig: {
                itemTitle: 'Товар',
                addButtonText: 'Добавить товар',
                removeButtonText: 'Удалить товар',
                min: 1,
                max: 20,
                maxNestingDepth: 2,
                fields: [
                  {
                    field: 'name',
                    label: 'Название товара',
                    type: 'text',
                    placeholder: 'Название товара',
                    rules: [
                      { type: 'required', message: 'Название товара обязательно' },
                      { type: 'minLength', value: 2, message: 'Минимум 2 символа' }
                    ],
                    defaultValue: ''
                  },
                  {
                    field: 'description',
                    label: 'Описание товара',
                    type: 'textarea',
                    placeholder: 'Описание товара',
                    rules: [],
                    defaultValue: ''
                  },
                  {
                    field: 'price',
                    label: 'Цена',
                    type: 'number',
                    placeholder: '0',
                    rules: [
                      { type: 'required', message: 'Цена обязательна' },
                      { type: 'min', value: 0, message: 'Цена не может быть отрицательной' }
                    ],
                    defaultValue: 0
                  },
                  {
                    field: 'image',
                    label: 'Изображение товара',
                    type: 'image',
                    rules: [],
                    defaultValue: ''
                  },
                  {
                    field: 'thumbnail',
                    label: 'Миниатюра товара',
                    type: 'image',
                    rules: [],
                    defaultValue: '',
                    imageUploadConfig: {
                      uploadUrl: '/api/upload',
                      fileParamName: 'file',
                      maxFileSize: 5 * 1024 * 1024,
                      uploadHeaders: {
                        'Authorization': 'Bearer token'
                      },
                      responseMapper: (response) => {
                        return response.data?.url || response.url || '';
                      },
                      onUploadError: (error) => {
                        console.error('Ошибка загрузки миниатюры:', error);
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}

