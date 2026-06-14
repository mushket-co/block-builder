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
    icon: '/icons/rich-text.svg',
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

  text: {
    title: 'Текстовый блок',
    icon: '/icons/text.svg',
    description: 'Добавьте текстовый контент',
    render: {
      kind: 'html',
      template: (props) => {
        const getUrl = (value) => {
          if (!value) return '';
          if (typeof value === 'string') return value;
          if (typeof value === 'object') return value.src || value.url || '';
          return '';
        };
        const getUrls = (value) => {
          if (Array.isArray(value)) {
            return value.map(getUrl).filter(Boolean);
          }
          const single = getUrl(value);
          return single ? [single] : [];
        };

        const imageUrl = getUrl(props.image);
        const imageUrls = getUrls(props.images);
        const fileUrl = getUrl(props.file);
        const fileUrls = getUrls(props.files);

        const imagesHtml = imageUrl
          ? `<div class="text-block__media" style="margin-top:16px;text-align:left;"><p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6c757d;">Изображение</p><img src="${imageUrl}" alt="" style="display:block;max-width:100%;height:auto;border-radius:4px;" /></div>`
          : '';
        const galleryHtml = imageUrls.length
          ? `<div class="text-block__media" style="margin-top:16px;text-align:left;"><p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6c757d;">Изображения</p><div style="display:flex;flex-wrap:wrap;gap:8px;">${imageUrls.map(url => `<img src="${url}" alt="" style="width:120px;height:120px;object-fit:cover;border-radius:4px;" />`).join('')}</div></div>`
          : '';
        const fileHtml = fileUrl
          ? `<div class="text-block__media" style="margin-top:16px;text-align:left;"><p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6c757d;">Файл</p><a href="${fileUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--bb-color-primary,#0066cc);font-size:14px;">Скачать файл</a></div>`
          : '';
        const filesHtml = fileUrls.length
          ? `<div class="text-block__media" style="margin-top:16px;text-align:left;"><p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6c757d;">Файлы</p><ul style="margin:0;padding-left:18px;">${fileUrls.map((url, index) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--bb-color-primary,#0066cc);font-size:14px;">Файл ${index + 1}</a></li>`).join('')}</ul></div>`
          : '';

        return `
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
              <p class="text-block__content" style="margin:0 0 12px;">${props.content}</p>
              ${imagesHtml}
              ${galleryHtml}
              ${fileHtml}
              ${filesHtml}
            </div>
          </div>
        </div>
      `;
      }
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
      },
      {
        field: 'image',
        label: 'Изображение (одно)',
        type: 'image',
        rules: [],
        defaultValue: '',
        fileUploadConfig: {
          uploadUrl: '/api/upload',
          fileParamName: 'file',
          maxFileSize: 5 * 1024 * 1024,
          responseMapper: (response) => ({ src: response.url })
        }
      },
      {
        field: 'images',
        label: 'Изображения (несколько)',
        type: 'image',
        multiple: true,
        rules: [],
        defaultValue: [],
        fileUploadConfig: {
          uploadUrl: '/api/upload',
          fileParamName: 'file',
          maxFileSize: 5 * 1024 * 1024,
          maxCount: 5,
          responseMapper: (response) => ({ src: response.url })
        }
      },
      {
        field: 'file',
        label: 'Файл (один)',
        type: 'file',
        rules: [],
        defaultValue: '',
        fileUploadConfig: {
          uploadUrl: '/api/upload',
          fileParamName: 'file',
          maxFileSize: 5 * 1024 * 1024,
          accept: '.pdf,.doc,.docx,.zip',
          responseMapper: (response) => response.url
        }
      },
      {
        field: 'files',
        label: 'Файлы (несколько)',
        type: 'file',
        multiple: true,
        rules: [],
        defaultValue: [],
        fileUploadConfig: {
          uploadUrl: '/api/upload',
          fileParamName: 'file',
          maxFileSize: 5 * 1024 * 1024,
          accept: '.pdf,.doc,.docx,.zip',
          maxCount: 5,
          responseMapper: (response) => response.url
        }
      }
    ],
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
        fileUploadConfig: {
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

  gallerySlider: {
    title: 'Слайдер галереи',
    icon: '/icons/slider.svg',
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
              fileUploadConfig: {
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
    icon: '/icons/card.svg',
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
    title: 'Богатые карточки (тест)',
    icon: '/icons/card.svg',
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
      kind: 'html',
      template: (props) => {
        const normalizeNewsId = (value) => {
          if (value === null || value === undefined || value === '') {
            return null;
          }

          if (typeof value === 'object' && value !== null && 'id' in value) {
            const id = Number(value.id);
            return Number.isNaN(id) ? value.id : id;
          }

          return value;
        };

        const getNewsLabel = (entry) => {
          if (typeof entry === 'object' && entry !== null && entry.name) {
            return entry.name;
          }

          return `Новость ID: ${normalizeNewsId(entry)}`;
        };

        const featuredNewsId = normalizeNewsId(props.featuredNewsId);
        const featuredNewsLabel =
          typeof props.featuredNewsId === 'object' &&
          props.featuredNewsId !== null &&
          props.featuredNewsId.name
            ? props.featuredNewsId.name
            : featuredNewsId;
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
                  🌟 Главная новость: ${featuredNewsLabel}
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
                ${newsIds.map(entry => `
                  <div style="
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 16px;
                    transition: all 0.2s;
                  " class="news-card">
                    <h4 style="margin: 0 0 8px 0; font-size: 16px;">
                      ${getNewsLabel(entry)}
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
          debounceMs: 1500,
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
      kind: 'html',
      template: (props) => {
        const blockStyle = props.hasBackground
          ? `background-color: ${props.backgroundColor || '#f0f0f0'}; padding: ${props.padding || '12px 24px'}; border-radius: 8px;`
          : '';
        const target = props.linkTarget || '_self';
        const rel = target === '_blank' ? ' rel="noopener noreferrer"' : '';
        const url = props.url || '#';
        const anchorClick = url.startsWith('#')
          ? `onclick="event.preventDefault(); document.querySelector('[data-block-id=&quot;${url.slice(1)}&quot;]')?.scrollIntoView({behavior:'smooth',block:'start'});"`
          : '';

        return `
          <div class="link-block" style="${blockStyle} text-align: center; margin: 20px 0;">
            <div class="container">
              <a
                href="${url}"
                target="${target}"
                ${rel}
                ${anchorClick}
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
        label: 'Якорь или URL',
        type: 'block-anchor',
        blockAnchorConfig: {
          placeholder: 'Выберите блок на странице',
          allowCustomUrl: true
        },
        rules: [
          { type: 'required', message: 'Укажите якорь или URL' }
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
      kind: 'html',
      template: (props) => {
        const getImageUrl = (img) => {
          if (!img) return '';
          if (typeof img === 'string') return img;
          if (typeof img === 'object' && img !== null) {
            return img.src || '';
          }
          return '';
        };

        const formatPrice = (price) => {
          if (typeof price === 'number') {
            return new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB'
            }).format(price);
          }
          return price;
        };

        const categories = props.categories || [];

        const categoriesHTML = categories.map((category, categoryIndex) => {
          const products = category.products || [];
          const productsHTML = products.map((product, productIndex) => {
            const imageUrl = getImageUrl(product.image);
            const thumbnailUrl = getImageUrl(product.thumbnail);
            return `
              <div class="product" style="
                background: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                transition: transform 0.2s, box-shadow 0.2s;
              ">
                ${imageUrl || thumbnailUrl ? `
                  <div class="product-images" style="
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                  ">
                    ${imageUrl ? `
                      <div class="product-image" style="
                        flex: 1;
                        height: 180px;
                        border-radius: 6px;
                        overflow: hidden;
                        background: #e9ecef;
                      ">
                        <img src="${imageUrl}" alt="${product.name || ''}" style="
                          width: 100%;
                          height: 100%;
                          object-fit: cover;
                        " />
                      </div>
                    ` : ''}
                    ${thumbnailUrl ? `
                      <div class="product-thumbnail" style="
                        width: 100px;
                        height: 180px;
                        border-radius: 6px;
                        overflow: hidden;
                        background: #e9ecef;
                        border: 2px solid #007bff;
                      ">
                        <img src="${thumbnailUrl}" alt="${product.name || ''} - миниатюра" style="
                          width: 100%;
                          height: 100%;
                          object-fit: cover;
                        " />
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
                <div class="product-info">
                  <h4 style="
                    font-size: 18px;
                    margin: 0 0 8px 0;
                    color: #333;
                    font-weight: 600;
                  ">${product.name || `Товар ${productIndex + 1}`}</h4>
                  ${product.description ? `
                    <p style="
                      font-size: 14px;
                      color: #666;
                      margin: 0 0 8px 0;
                      line-height: 1.4;
                    ">${product.description}</p>
                  ` : ''}
                  ${product.price ? `
                    <div style="
                      font-size: 20px;
                      font-weight: 700;
                      color: #007bff;
                      margin-top: 8px;
                    ">${formatPrice(product.price)}</div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('');

          return `
            <div class="category" style="
              background: white;
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            ">
              <div class="category-header" style="
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid #e9ecef;
              ">
                <h3 style="
                  font-size: 24px;
                  margin: 0 0 8px 0;
                  color: #333;
                  font-weight: 600;
                ">${category.name || `Категория ${categoryIndex + 1}`}</h3>
                ${category.description ? `
                  <p style="
                    font-size: 16px;
                    color: #666;
                    margin: 0;
                    line-height: 1.5;
                  ">${category.description}</p>
                ` : ''}
              </div>
              <div class="products" style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
              ">
                ${productsHTML}
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="nested-repeater-block" style="
            padding: 40px 20px;
            background: #f8f9fa;
          ">
            <div class="container" style="
              max-width: 1200px;
              margin: 0 auto;
            ">
              ${props.title ? `
                <h2 style="
                  text-align: center;
                  font-size: 36px;
                  margin-bottom: 16px;
                  color: #333;
                  font-weight: 700;
                ">${props.title}</h2>
              ` : ''}
              ${props.description ? `
                <p style="
                  text-align: center;
                  font-size: 18px;
                  color: #666;
                  margin-bottom: 40px;
                ">${props.description}</p>
              ` : ''}
              <div class="categories" style="
                display: flex;
                flex-direction: column;
                gap: 32px;
              ">
                ${categoriesHTML}
              </div>
            </div>
          </div>
        `;
      }
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
                    fileUploadConfig: {
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

