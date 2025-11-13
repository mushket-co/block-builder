/**
 * Конфигурация блоков для чистого JS
 * Демонстрирует использование BlockBuilder без фреймворков
 * ✅ Современный ES модули с Vite
 * ✅ Настоящий Swiper из npm
 */

import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export const blockConfigs = {
  richText: {
    title: 'Rich Text (с визуальным редактором)',
    icon: '✍️',
    description: 'Блок с визуальным редактором Jodit для форматированного текста',
    render: {
      kind: 'html',
      template: (props) => `
        <div class="rich-text-block">
          <div class="container">
            <div style="
              font-size: ${props.fontSize || 16}px;
              color: ${props.textColor || '#333333'};
              text-align: ${props.textAlign || 'left'};
              padding: 15px;
              border: 1px solid #eee;
              border-radius: 4px;
              background-color: #fff;
            ">
              ${props.content || '<p>Нет содержимого</p>'}
            </div>
          </div>
        </div>
      `
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
          { type: 'min', value: 12, message: 'Минимум: 12px' },
          { type: 'max', value: 32, message: 'Максимум: 32px' }
        ],
        defaultValue: 16
      },
      {
        field: 'textColor',
        label: 'Цвет текста',
        type: 'color',
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
        defaultValue: 'left'
      }
    ]
  },

  spacedText: {
    title: 'Текст с отступами',
    icon: '📐',
    description: 'Текстовый блок с управлением отступами',
    render: {
      kind: 'html',
      template: (props) => {
        // Используем CSS переменные для padding (они автоматически устанавливаются на .block-builder-block)
        // margin применяется автоматически к .block-builder-block
        return `
          <div class="spaced-text-block">
            <div class="container">
              <div style="
                padding-top: var(--spacing-padding-top, 0px);
                padding-bottom: var(--spacing-padding-bottom, 0px);
                text-align: ${props.textAlign};
                font-size: ${props.fontSize}px;
                color: ${props.color};
                background: ${props.backgroundColor};
                border-radius: 8px;
                transition: all 0.3s ease;
              " >
                ${props.content}
              </div>
            </div>
          </div>
        `
      }
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        placeholder: 'Введите текст...',
        rules: [
          { type: 'required', message: 'Текст обязателен' }
        ],
        defaultValue: 'Текст с управляемыми отступами'
      },
      {
        field: 'fontSize',
        label: 'Размер шрифта',
        type: 'number',
        rules: [
          { type: 'min', value: 12, message: 'Минимум: 12px' },
          { type: 'max', value: 48, message: 'Максимум: 48px' }
        ],
        defaultValue: 18
      },
      {
        field: 'color',
        label: 'Цвет текста',
        type: 'color',
        defaultValue: '#333333'
      },
      {
        field: 'backgroundColor',
        label: 'Цвет фона',
        type: 'color',
        defaultValue: '#f8f9fa'
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
        defaultValue: 'center'
      }
    ],
    // 🧪 Кастомные брекпоинты для тестирования (так же как во Vue примере)
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

  text: {
    title: 'Текстовый блок',
    icon: '📝',
    description: 'Добавьте текстовый контент',
    render: {
      kind: 'html',
      template: (props) => `
        <div class="text-block">
          <div class="container">
            <div style="
              text-align: ${props.textAlign};
              font-size: ${props.fontSize}px;
              color: ${props.color};
              padding: 10px;
              border: 1px solid #e9ecef;
              border-radius: 4px;
              background: #f8f9fa;
              transition: all 0.2s ease;
            " onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
              ${props.content}
            </div>
          </div>
        </div>
      `
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
        defaultValue: 'Пример текста'
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
    ]
  },

  image: {
    title: 'Изображение',
    icon: '🖼️',
    description: 'Добавьте изображение',
    render: {
      kind: 'html',
      template: (props) => {
        // Преобразуем src в URL для img тега
        // base64 - всегда строка
        // серверное загрузка - объект с обязательным src
        const getImageUrl = (src) => {
          if (typeof src === 'string') return src;
          if (typeof src === 'object' && src !== null) {
            return src.src || '';
          }
          return '';
        };
        const imageUrl = getImageUrl(props.image);

        return `
        <div class="image-block" style="text-align: center; margin: 20px 0;">
          <div class="container">
            <img
              src="${imageUrl}"
              alt="${props.alt}"
              style="
                border-radius: ${props.borderRadius}px;
                max-width: 100%;
                height: auto;
                object-fit: cover;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
              "
              onmouseover="this.style.transform='scale(1.02)'"
              onmouseout="this.style.transform='scale(1)'"
            />
          </div>
        </div>
      `;
      }
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
          maxFileSize: 1 * 1024 * 1024,
          responseMapper: (response) => ({
            src: response.url
          }) // 5MB для демо
          // responseMapper: (response) => response.url // Извлекаем только URL
          // ИЛИ можно вернуть объект с метаданными:
          // responseMapper: (response) => ({ src: response.url, width: response.width, height: response.height })
          // uploadHeaders: { 'Authorization': 'Bearer test-token' }, // Раскомментируйте для теста заголовков
        }
      },
      {
        field: 'alt',
        label: 'Описание',
        type: 'text',
        placeholder: 'Описание изображения',
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
    description: 'Интерактивная кнопка',
    render: {
      kind: 'html',
      template: (props) => `
        <div class="button-block" style="text-align: center; margin: 20px 0;">
          <div class="container">
            <button
              class="custom-button"
              style="
                background-color: ${props.backgroundColor};
                color: ${props.color};
                border-radius: ${props.borderRadius}px;
                padding: ${props.padding};
                border: none;
                cursor: pointer;
                font-size: 16px;
                font-weight: 500;
                transition: all 0.2s ease;
                padding: 20px;
              "
              onclick="this.textContent='Загрузка...'; setTimeout(() => this.textContent='${props.text.replace(/'/g, "\\'")}', 1000)"
              onmouseover="this.style.transform='scale(1.05)'; this.style.filter='brightness(1.1)'"
              onmouseout="this.style.transform='scale(1)'; this.style.filter='brightness(1)'"
            >
              ${props.text}
            </button>
          </div>
        </div>
      `
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
      }
    ]
  },

  gallerySlider: {
    title: 'Слайдер галереи',
    icon: '🎠',
    description: '✅ НАСТОЯЩИЙ Swiper из npm! (только с Vite сборкой)',
    render: {
      kind: 'custom',
      // Функция рендеринга с императивным Swiper
      mount: (container, props) => {
        // Генерируем уникальный ID для слайдера
        const sliderId = `swiper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const getImageUrl = (image) => {
          if (!image) return '';
          if (typeof image === 'string') return image;
          if (typeof image === 'object' && image !== null) {
            return image.src || image.url || '';
          }
          return '';
        };

        const slides = (props.slides || []).map(slide => ({
          ...slide,
          imageUrl: getImageUrl(slide.image)
        })).filter(slide => slide.imageUrl && slide.title)

        // Преобразуем значения
        const autoplayValue = typeof props.autoplay === 'string'
          ? (props.autoplay === 'on' || props.autoplay === 'true')
          : props.autoplay
        const autoplayDelay = typeof props.autoplayDelay === 'string'
          ? parseInt(props.autoplayDelay, 10)
          : props.autoplayDelay
        const loopValue = typeof props.loop === 'string'
          ? (props.loop === 'on' || props.loop === 'true')
          : props.loop
        const spaceBetween = typeof props.spaceBetween === 'string'
          ? parseInt(props.spaceBetween, 10)
          : props.spaceBetween

        // Создаем HTML
        container.innerHTML = `
          <div class="gallery-slider-block" style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <div class="container">
              <div>
                ${props.title ? `<h2 style="text-align: center; margin-bottom: 30px; font-size: 28px; font-weight: 700; color: #333;">${props.title}</h2>` : ''}

                <div class="swiper" id="${sliderId}" style="width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <div class="swiper-wrapper">
                    ${slides.map(slide => `
                      <div class="swiper-slide">
                        <div style="position: relative; background: white;">
                          <img src="${slide.imageUrl}" alt="${slide.title}" style="width: 100%; height: 400px; object-fit: cover; display: block;" />
                          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 30px 20px 20px; color: white;">
                            <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">${slide.title}</h3>
                            <p style="margin: 0; font-size: 14px; opacity: 0.9;">${slide.description}</p>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>

                  <div class="swiper-button-next"></div>
                  <div class="swiper-button-prev"></div>
                  <div class="swiper-pagination"></div>
                </div>
              </div>
            </div>
          </div>
        `

        // Инициализируем Swiper после рендера
        setTimeout(() => {
          const swiperEl = container.querySelector(`#${sliderId}`)
          if (swiperEl) {
            new Swiper(swiperEl, {
              modules: [Navigation, Pagination, Autoplay],
              slidesPerView: 2,
              spaceBetween: spaceBetween,
              loop: loopValue,
              autoplay: autoplayValue ? {
                delay: autoplayDelay,
                disableOnInteraction: false
              } : false,
              pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true
              },
              navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
              },
              grabCursor: true
            })
          }
        }, 0)
      }
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок галереи',
        type: 'text',
        placeholder: 'Галерея изображений',
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
            image: '',
            title: 'Природа',
            description: 'Красивый пейзаж природы'
          },
          {
            image: '',
            title: 'Эдвард Григ',
            description: 'Знаменитый норвежский композитор'
          },
          {
            image: '',
            title: 'Медведь',
            description: 'Дикая природа'
          },
          {
            image: '',
            title: 'Губка Боб',
            description: 'Популярный мультипликационный персонаж'
          }
        ],
        repeaterConfig: {
          itemTitle: 'Слайд',
          addButtonText: 'Добавить слайд',
          removeButtonText: 'Удалить',
          min: 3, // ✅ РАБОТАЕТ! т.к. есть required в rules (минимум 3 слайда)
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
                maxFileSize: 1 * 1024 * 1024, // 1MB для демо
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
              field: 'relatedNews',
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
      // Настройки слайдера
      {
        field: 'autoplay',
        label: 'Автопрокрутка',
        type: 'checkbox',
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

  cardList: {
    title: 'Список карточек',
    icon: '🃏',
    description: 'Сетка из карточек с изображениями и описаниями',
    render: {
      kind: 'custom',
      mount: (container, props) => {
        const cards = (props.cards || []).filter(card => card.title && card.text);

        // Преобразуем изображение в URL
        // base64 - всегда строка
        // серверное загрузка - объект с обязательным src
        const getImageUrl = (image) => {
          if (!image) return '';
          if (typeof image === 'string') return image;
          if (typeof image === 'object' && image !== null) {
            return image.src || '';
          }
          return '';
        };

        container.innerHTML = `
          <div class="card-list-block" style="padding: 40px 20px; background: #f8f9fa;">
            <div class="container">
              ${props.title ? `<h2 style="text-align: center; margin-bottom: 40px; font-size: 32px; font-weight: 700; color: #333;">${props.title}</h2>` : ''}

              <div class="cards-grid" style="
                display: grid;
                grid-template-columns: repeat(${props.columns || 3}, 1fr);
                gap: ${props.gap || 16}px;
                max-width: 1200px;
                margin: 0 auto;
              ">
              ${cards.map(card => {
                const imageUrl = getImageUrl(card.image);
                return `
                <div class="card" style="
                  background: ${props.cardBackground || '#ffffff'};
                  border-radius: ${props.cardBorderRadius || 8}px;
                  overflow: hidden;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  transition: all 0.3s ease;
                  cursor: pointer;
                  display: flex;
                  flex-direction: column;
                ">
                  ${imageUrl ? `
                    <div style="
                      width: 100%;
                      height: 200px;
                      overflow: hidden;
                      background: #e9ecef;
                    ">
                      <img
                        src="${imageUrl}"
                        alt="${card.title}"
                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                      />
                    </div>
                  ` : ''}

                  <div style="padding: 24px; flex: 1; display: flex; flex-direction: column;">
                    <h3 style="
                      margin: 0 0 12px 0;
                      font-size: 20px;
                      font-weight: 600;
                      color: ${props.cardTextColor || '#333333'};
                    ">${card.title}</h3>

                    <p style="
                      margin: 0 0 20px 0;
                      font-size: 14px;
                      line-height: 1.6;
                      color: ${props.cardTextColor || '#333333'};
                      opacity: 0.8;
                      flex: 1;
                    ">${card.text}</p>

                    ${card.button && card.link ? `
                      <a
                        href="${card.link}"
                        style="
                          display: inline-block;
                          padding: 10px 20px;
                          background: #007bff;
                          color: white;
                          text-decoration: none;
                          border-radius: 4px;
                          font-size: 14px;
                          font-weight: 500;
                          transition: background 0.2s ease;
                          text-align: center;
                        "
                        onmouseover="this.style.background='#0056b3'"
                        onmouseout="this.style.background='#007bff'"
                      >${card.button}</a>
                    ` : ''}
                  </div>
                </div>
              `;
              }).join('')}
              </div>
            </div>
          </div>
        `;

        // Добавляем hover эффект для карточек
        const cardElements = container.querySelectorAll('.card');
        cardElements.forEach(card => {
          card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          });
          card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          });
        });
      }
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
      // ✅ Массив карточек через repeater
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
          { value: 1, label: '1 колонка' },
          { value: 2, label: '2 колонки' },
          { value: 3, label: '3 колонки' },
          { value: 4, label: '4 колонки' }
        ],
        rules: [],
        defaultValue: 3
      },
      {
        field: 'gap',
        label: 'Отступ между карточками',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум: 0' },
          { type: 'max', value: 50, message: 'Максимум: 50' }
        ],
        defaultValue: 16
      }
    ]
  },

  richCardList: {
    title: '🎯 Богатые карточки (тест)',
    icon: '💎',
    description: 'Тестовый блок с множеством полей в каждой карточке для pure JS',
    render: {
      kind: 'html',
      template: (props) => {
        const cards = props.cards || []

        const getImageUrl = (image) => {
          if (!image) return '';
          if (typeof image === 'string') return image;
          if (typeof image === 'object' && image !== null) {
            return image.src || '';
          }
          return '';
        };

        const cardsHtml = cards.map(card => {
          const cardBg = card.backgroundColor || props.cardDefaultBg || '#ffffff'
          const cardTextColor = card.textColor || props.cardDefaultTextColor || '#333333'
          const imageUrl = getImageUrl(card.image);
          const imageMobileUrl = getImageUrl(card.imageMobile);

          return `
            <div class="rich-card" style="
              background-color: ${cardBg};
              color: ${cardTextColor};
              border-radius: ${props.cardBorderRadius || 12}px;
              box-shadow: ${props.cardShadow || '0 4px 12px rgba(0, 0, 0, 0.1)'};
              overflow: hidden;
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            ">
              ${imageUrl || imageMobileUrl ? `
                <div style="
                  width: 100%;
                  height: 240px;
                  overflow: hidden;
                ">
                  <picture>
                    ${imageMobileUrl ? `
                      <source srcset="${imageMobileUrl}" media="(max-width: 768px)" />
                    ` : ''}
                    <img
                      src="${imageUrl || imageMobileUrl}"
                      alt="${card.imageAlt || card.title || ''}"
                      style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                      "
                    />
                  </picture>
                </div>
              ` : ''}

              <div style="
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
              ">
                ${card.title ? `
                  <h3 style="
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    line-height: 1.3;
                  ">${card.title}</h3>
                ` : ''}

                ${card.subtitle ? `
                  <h4 style="
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    line-height: 1.4;
                    opacity: 0.9;
                  ">${card.subtitle}</h4>
                ` : ''}

                ${card.text ? `
                  <p style="
                    margin: 0;
                    font-size: 16px;
                    line-height: 1.6;
                    opacity: 0.85;
                  ">${card.text}</p>
                ` : ''}

                ${card.detailedText ? `
                  <div style="
                    font-size: 14px;
                    line-height: 1.6;
                    opacity: 0.75;
                    margin-top: 8px;
                  ">${card.detailedText}</div>
                ` : ''}

                ${card.relatedArticle ? `
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    padding: 12px;
                    background-color: rgba(102, 126, 234, 0.1);
                    border-radius: 6px;
                    margin-top: 12px;
                  ">
                    <span style="font-weight: 600; white-space: nowrap;">📰 Связанная статья:</span>
                    <span style="opacity: 0.9;">
                      ${typeof card.relatedArticle === 'object' && card.relatedArticle !== null
                        ? (card.relatedArticle.name || card.relatedArticle.id || '')
                        : card.relatedArticle}
                    </span>
                  </div>
                ` : ''}

                ${card.meetingPlace || card.meetingTime || card.participantsCount ? `
                  <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 16px;
                    background-color: rgba(0, 0, 0, 0.03);
                    border-radius: 8px;
                    margin-top: 12px;
                  ">
                    ${card.meetingPlace ? `
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                      ">
                        <span style="font-weight: 600; white-space: nowrap;">📍 Место:</span>
                        <span style="opacity: 0.85;">${card.meetingPlace}</span>
                      </div>
                    ` : ''}
                    ${card.meetingTime ? `
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                      ">
                        <span style="font-weight: 600; white-space: nowrap;">🕐 Время:</span>
                        <span style="opacity: 0.85;">${card.meetingTime}</span>
                      </div>
                    ` : ''}
                    ${card.participantsCount ? `
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                      ">
                        <span style="font-weight: 600; white-space: nowrap;">👥 Участников:</span>
                        <span style="opacity: 0.85;">${card.participantsCount}</span>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                ${card.link && card.buttonText ? `
                  <a
                    href="${card.link}"
                    target="${card.linkTarget || '_self'}"
                    ${card.linkTarget === '_blank' ? 'rel="noopener noreferrer"' : ''}
                    style="
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      padding: 12px 24px;
                      text-decoration: none;
                      font-weight: 600;
                      font-size: 16px;
                      margin-top: auto;
                      background-color: ${props.buttonColor || '#667eea'};
                      color: ${props.buttonTextColor || '#ffffff'};
                      border-radius: ${props.buttonBorderRadius || 6}px;
                      transition: opacity 0.3s ease, transform 0.2s ease;
                      cursor: pointer;
                      align-self: flex-start;
                    "
                    onmouseover="this.style.opacity='0.9'; this.style.transform='translateX(4px)'"
                    onmouseout="this.style.opacity='1'; this.style.transform='translateX(0)'"
                  >${card.buttonText}</a>
                ` : ''}
              </div>
            </div>
          `
        }).join('')

        return `
          <div class="rich-card-list" style="
            width: 100%;
            padding: 20px;
          ">
            <div class="container">
              ${props.sectionTitle ? `
                <h2 style="
                  margin: 0 0 32px 0;
                  font-weight: 700;
                  line-height: 1.2;
                  color: ${props.titleColor || '#333333'};
                  font-size: ${props.titleSize || 32}px;
                  text-align: ${props.titleAlign || 'center'};
                ">${props.sectionTitle}</h2>
              ` : ''}

              <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(${props.cardMinWidth || 300}px, 1fr));
                gap: ${props.gap || 24}px;
                width: 100%;
            ">
                ${cardsHtml}
              </div>
            </div>
          </div>

          <style>
            .rich-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
            }

            @media (max-width: 768px) {
              .rich-card-list {
                padding: 16px !important;
              }

              .rich-card-list h2 {
                margin-bottom: 24px !important;
              }

              .rich-card > div:first-child {
                height: 200px !important;
              }

              .rich-card > div:last-child {
                padding: 20px !important;
                gap: 10px !important;
              }

              .rich-card h3 {
                font-size: 20px !important;
              }

              .rich-card h4 {
                font-size: 16px !important;
              }

              .rich-card p {
                font-size: 14px !important;
              }

              .rich-card > div:last-child > div {
                font-size: 13px !important;
              }
            }
          </style>
        `
      }
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
          min: 1,
          max: 20,
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
              type: 'custom',
              rules: [],
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
              type: 'image',
              rules: [],
              defaultValue: ''
            },
            {
              field: 'imageMobile',
              label: 'Изображение (мобильное)',
              type: 'image',
              rules: [],
              defaultValue: ''
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
            },
            {
              field: 'relatedArticle',
              label: 'Связанная статья',
              type: 'api-select',
              rules: [],
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

  // ✅ ПРИМЕР: Блок с API Select
  newsList: {
    title: '📰 Список новостей из API',
    icon: '📰',
    description: 'Блок отображения новостей, выбранных через API',
    render: {
      kind: 'html',
      template: (props) => {
        const featuredNewsId = props.featuredNewsId || null;
        const newsIds = Array.isArray(props.newsIds) ? props.newsIds : [];

        return `
          <div class="news-list-block" style="
            background-color: ${props.backgroundColor || '#f8f9fa'};
            color: ${props.textColor || '#333333'};
            padding: 20px;
            border-radius: 8px;
          ">
            <div class="container">
              <!-- Заголовок -->
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">
                ${props.title || 'Последние новости'}
              </h2>

            ${featuredNewsId ? `
              <!-- Главная новость -->
              <div style="
                background: rgba(102, 126, 234, 0.1);
                border: 2px solid #667eea;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
              ">
                <h3 style="margin: 0 0 10px 0; color: #667eea;">
                  🌟 Главная новость (ID: ${featuredNewsId})
                </h3>
                <p style="margin: 0; opacity: 0.7; font-size: 14px;">
                  В реальном приложении здесь будут данные, загруженные по API
                </p>
              </div>
            ` : ''}

            ${newsIds.length > 0 ? `
              <!-- Список новостей -->
              <div style="
                display: grid;
                grid-template-columns: repeat(${props.columns || '2'}, 1fr);
                gap: 16px;
                margin-top: 20px;
              ">
                ${newsIds.map(id => `
                  <div style="
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 16px;
                    transition: all 0.2s;
                  " class="news-card">
                    <h4 style="margin: 0 0 8px 0; font-size: 16px;">
                      Новость ID: ${id}
                    </h4>
                    ${props.showDate ? `
                      <p style="margin: 0; font-size: 12px; opacity: 0.6;">
                        ${new Date().toLocaleDateString('ru-RU')}
                      </p>
                    ` : ''}
                    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">
                      Данные будут загружены из вашего API в реальном приложении
                    </p>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="
                text-align: center;
                padding: 40px 20px;
                opacity: 0.5;
              ">
                📋 Новости не выбраны. Настройте блок в редакторе.
              </div>
            `}
            </div>
          </div>

          <style>
            .news-card:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transform: translateY(-2px);
            }
          </style>
        `;
      }
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
          url: 'http://localhost:3002/api/news',
          method: 'GET',
          multiple: false, // Одиночный выбор
          placeholder: 'Начните вводить для поиска новости...',
          limit: 10,
          debounceMs: 300,
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
        rules: [
          { type: 'required', message: 'Выберите хотя бы одну новость' },
          { type: 'minLength', value: 2, message: 'Выберите минимум 2 новости' }
        ],
        defaultValue: [],
        apiSelectConfig: {
          url: 'http://localhost:3002/api/news',
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
      kind: 'custom',
      mount: (container, props) => {
        const stages = props.stages || []
        const blockId = `timelapse-${Math.random().toString(36).substr(2, 9)}`

        // Создаем HTML
        container.innerHTML = `
          <div class="timelapse-block" id="${blockId}">
            <div class="container">
              ${props.title ? `<h2 class="timelapse-block__title">${props.title}</h2>` : ''}

              <div class="timelapse-block__content">
              <!-- Левая панель: список этапов -->
              <div class="timelapse-block__stages" data-stages-container>
                ${stages.map((stage, index) => `
                  <div class="timelapse-block__stage" data-stage-index="${index}">
                    <div class="timelapse-block__stage-number">${index + 1}</div>
                    <div class="timelapse-block__stage-content">
                      <div class="timelapse-block__stage-name">${stage.name || 'Этап ' + (index + 1)}</div>
                      <div class="timelapse-block__stage-duration">${stage.duration || 0} сек</div>
                    </div>
                    <div class="timelapse-block__stage-check" style="display: none;">✓</div>
                  </div>
                `).join('')}
              </div>

              <!-- Правая панель: таймер -->
              <div class="timelapse-block__timer-panel">
                <div class="timelapse-block__timer">
                  <div class="timelapse-block__timer-value" data-timer-value>00:00</div>
                  <div class="timelapse-block__timer-label">до следующего этапа</div>
                </div>

                <div class="timelapse-block__current-stage" data-current-stage>
                  <div class="timelapse-block__current-label">Текущий этап:</div>
                  <div class="timelapse-block__current-name" data-current-name>Нажмите "Старт"</div>
                </div>

                <div class="timelapse-block__progress">
                  <div class="timelapse-block__progress-bar" data-progress-bar style="width: 0%"></div>
                </div>

                <div class="timelapse-block__controls">
                  <button class="timelapse-block__btn timelapse-block__btn--start" data-start-btn>Старт</button>
                  <button class="timelapse-block__btn timelapse-block__btn--pause" data-pause-btn style="display: none;">Пауза</button>
                  <button class="timelapse-block__btn timelapse-block__btn--reset" data-reset-btn>Сброс</button>
                </div>

                <div class="timelapse-block__completed" data-completed style="display: none;">
                  🎉 Все этапы завершены!
                </div>
              </div>
              </div>
            </div>
          </div>

          <style>
            .timelapse-block {
              padding: 20px;
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
        `

        // Инициализация логики после рендера HTML
        setTimeout(() => {
          const blockEl = container.querySelector(`#${blockId}`)
          if (!blockEl) {
            console.error('Timelapse block not found')
            return
          }

          let currentStageIndex = 0
          let timeLeft = 0
          let isRunning = false
          let isCompleted = false
          let intervalId = null

          // Элементы DOM
          const timerValue = blockEl.querySelector('[data-timer-value]')
          const currentName = blockEl.querySelector('[data-current-name]')
          const progressBar = blockEl.querySelector('[data-progress-bar]')
          const startBtn = blockEl.querySelector('[data-start-btn]')
          const pauseBtn = blockEl.querySelector('[data-pause-btn]')
          const resetBtn = blockEl.querySelector('[data-reset-btn]')
          const completedMsg = blockEl.querySelector('[data-completed]')
          const stageElements = blockEl.querySelectorAll('[data-stage-index]')

          function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60)
            const secs = seconds % 60
            return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0')
          }

          function updateUI() {
            if (!timerValue || !currentName || !progressBar) return

            timerValue.textContent = formatTime(timeLeft)

            if (stages[currentStageIndex]) {
              currentName.textContent = stages[currentStageIndex].name

              // Обновляем прогресс
              const elapsed = stages[currentStageIndex].duration - timeLeft
              const percentage = (elapsed / stages[currentStageIndex].duration) * 100
              progressBar.style.width = percentage + '%'
            } else {
              currentName.textContent = 'Нажмите "Старт"'
              progressBar.style.width = '0%'
            }

            // Обновляем состояние этапов
            stageElements.forEach((el, index) => {
              el.classList.remove('timelapse-block__stage--active', 'timelapse-block__stage--completed')
              const check = el.querySelector('.timelapse-block__stage-check')

              if (index === currentStageIndex) {
                el.classList.add('timelapse-block__stage--active')
                if (check) check.style.display = 'none'
              } else if (index < currentStageIndex) {
                el.classList.add('timelapse-block__stage--completed')
                if (check) check.style.display = 'block'
              } else {
                if (check) check.style.display = 'none'
              }
            })
          }

          function start() {
            if (isCompleted) return

            isRunning = true
            if (startBtn) startBtn.style.display = 'none'
            if (pauseBtn) pauseBtn.style.display = 'inline-block'

            if (timeLeft === 0 && stages[currentStageIndex]) {
              timeLeft = stages[currentStageIndex].duration
            }

            intervalId = setInterval(() => {
              if (timeLeft > 0) {
                timeLeft--
                updateUI()
              } else {
                moveToNextStage()
              }
            }, 1000)
          }

          function pause() {
            isRunning = false
            if (startBtn) {
              startBtn.style.display = 'inline-block'
              startBtn.textContent = 'Продолжить'
            }
            if (pauseBtn) pauseBtn.style.display = 'none'
            clearTimer()
          }

          function reset() {
            isRunning = false
            isCompleted = false
            currentStageIndex = 0
            timeLeft = stages[0] ? stages[0].duration : 0

            if (startBtn) {
              startBtn.style.display = 'inline-block'
              startBtn.textContent = 'Старт'
            }
            if (pauseBtn) pauseBtn.style.display = 'none'
            if (completedMsg) completedMsg.style.display = 'none'

            clearTimer()
            updateUI()
          }

          function moveToNextStage() {
            if (currentStageIndex < stages.length - 1) {
              currentStageIndex++
              timeLeft = stages[currentStageIndex].duration
              updateUI()
            } else {
              isCompleted = true
              isRunning = false
              if (completedMsg) completedMsg.style.display = 'block'
              if (startBtn) startBtn.style.display = 'none'
              if (pauseBtn) pauseBtn.style.display = 'none'
              clearTimer()
            }
          }

          function clearTimer() {
            if (intervalId) {
              clearInterval(intervalId)
              intervalId = null
            }
          }

          // Инициализация
          if (stages.length > 0) {
            timeLeft = stages[0].duration
          }
          updateUI()

          // События
          if (startBtn) startBtn.addEventListener('click', start)
          if (pauseBtn) pauseBtn.addEventListener('click', pause)
          if (resetBtn) resetBtn.addEventListener('click', reset)

          // Очистка при удалении блока
          blockEl.cleanup = clearTimer
        }, 0)
      }
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
  },

  link: {
    title: 'Блок ссылки',
    icon: '🔗',
    description: 'Блок с ссылкой, выбором открытия и фоном',
    render: {
      kind: 'html',
      template: (props) => {
        const blockStyle = props.hasBackground
          ? `background-color: ${props.backgroundColor || '#f0f0f0'}; padding: ${props.padding || '12px 24px'}; border-radius: 8px;`
          : '';
        const target = props.linkTarget || '_self';
        const rel = target === '_blank' ? ' rel="noopener noreferrer"' : '';

        return `
          <div class="link-block" style="${blockStyle} text-align: center; margin: 20px 0;">
            <div class="container">
              <a
                href="${props.url || '#'}"
                target="${target}"
                ${rel}
                style="
                  color: var(--bb-color-primary);
                  text-decoration: none;
                  font-size: 16px;
                  font-weight: 500;
                  transition: color 0.2s ease;
                "
                onmouseover="this.style.color='var(--bb-color-primary-dark)'; this.style.textDecoration='underline';"
                onmouseout="this.style.color='var(--bb-color-primary)'; this.style.textDecoration='none';"
              >
                ${props.text || 'Ссылка'}
              </a>
            </div>
          </div>
        `;
      }
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
        type: 'url',
        placeholder: 'https://example.com',
        rules: [
          { type: 'required', message: 'URL обязателен' },
          { type: 'url', message: 'Введите корректный URL' }
        ],
        defaultValue: 'https://example.com'
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
        defaultValue: '#f0f0f0'
      }
    ]
  }
}

