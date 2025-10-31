/**
 * Конфигурация блоков для пользователя
 * Пользователь настраивает только типы блоков, их поля и правила валидации
 * Шаблоны рендеринга и UI компоненты предоставляет пакет
 */

// Конфигурация блоков - пользователь определяет структуру И UI-блоки
export const blockConfigs = {
  text: {
    title: 'Текстовый блок',
    icon: '📝',
    description: 'Добавьте текстовый контент на страницу',
    // HTML template для рендеринга блока
    template: (props) => `
      <div style="
        text-align: ${props.textAlign}; 
        font-size: ${props.fontSize}px; 
        color: ${props.color};
        padding: 10px;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        background: #f8f9fa;
      ">
        ${props.content}
      </div>
    `,
    // Новый формат render (опционально, для демонстрации)
    render: {
      kind: 'html',
      template: (props) => `
        <div style="
          text-align: ${props.textAlign}; 
          font-size: ${props.fontSize}px; 
          color: ${props.color};
          padding: 10px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          background: #f8f9fa;
        ">
          ${props.content}
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
        rules: [
          { type: 'required', message: 'Цвет обязателен' }
        ],
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
        rules: [
          { type: 'required', message: 'Выравнивание обязательно' }
        ],
        defaultValue: 'left'
      }
    ]
  },

  image: {
    title: 'Блок изображения',
    icon: '🖼️',
    description: 'Добавьте изображение на страницу',
    // HTML template для рендеринга блока
    template: (props) => `
      <div style="text-align: center; margin: 20px 0;">
        <img 
          src="${props.src}" 
          alt="${props.alt}" 
          style="
            max-width: 100%;
            height: auto;
            border-radius: ${props.borderRadius}px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          " 
        />
      </div>
    `,
    fields: [
      {
        field: 'src',
        label: 'URL изображения',
        type: 'text',
        placeholder: 'https://example.com/image.jpg',
        rules: [
          { type: 'required', message: 'URL изображения обязателен' }
        ],
        defaultValue: '../static-files/img/1364537351_peyzazhi-na-rabochiy-stol-1.jpeg'
      },
      {
        field: 'alt',
        label: 'Альтернативный текст',
        type: 'text',
        placeholder: 'Описание изображения',
        rules: [
          { type: 'required', message: 'Альтернативный текст обязателен' }
        ],
        defaultValue: ''
      },
      {
        field: 'borderRadius',
        label: 'Скругление углов',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Скругление не может быть отрицательным' },
          { type: 'max', value: 50, message: 'Максимальное скругление: 50px' }
        ],
        defaultValue: 0
      }
    ]
  },

  button: {
    title: 'Кнопка',
    icon: '🔘',
    description: 'Добавьте интерактивную кнопку',
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
        defaultValue: 'Кнопка'
      },
      {
        field: 'backgroundColor',
        label: 'Цвет фона',
        type: 'color',
        rules: [
          { type: 'required', message: 'Цвет фона обязателен' }
        ],
        defaultValue: '#007bff'
      },
      {
        field: 'color',
        label: 'Цвет текста',
        type: 'color',
        rules: [
          { type: 'required', message: 'Цвет текста обязателен' }
        ],
        defaultValue: '#ffffff'
      },
      {
        field: 'borderRadius',
        label: 'Скругление углов',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Скругление не может быть отрицательным' },
          { type: 'max', value: 50, message: 'Максимальное скругление: 50px' }
        ],
        defaultValue: 4
      },
      {
        field: 'padding',
        label: 'Отступы',
        type: 'text',
        placeholder: '8px 16px',
        rules: [
          { type: 'required', message: 'Отступы обязательны' }
        ],
        defaultValue: '8px 16px'
      },
      {
        field: 'onClick',
        label: 'Обработчик клика',
        type: 'text',
        placeholder: 'alert("Привет!")',
        rules: [
          { type: 'required', message: 'Обработчик клика обязателен' }
        ],
        defaultValue: 'alert("Привет!")'
      }
    ]
  },

  cardlist: {
    title: 'Список карточек',
    icon: '🃏',
    description: 'Создайте список карточек с информацией',
    // HTML template для pure-js рендера
    template: (props) => {
      const title = props.title || '';
      const columns = parseInt(props.columns || '3', 10);
      const gap = parseInt(props.gap || '16', 10);
      const cardBackground = props.cardBackground || '#ffffff';
      const cardTextColor = props.cardTextColor || '#333333';
      const cardBorderRadius = parseInt(props.cardBorderRadius || '8', 10);

      const cards = [
        { title: props.card1_title, text: props.card1_text, button: props.card1_button, link: props.card1_link, image: props.card1_image },
        { title: props.card2_title, text: props.card2_text, button: props.card2_button, link: props.card2_link, image: props.card2_image },
        { title: props.card3_title, text: props.card3_text, button: props.card3_button, link: props.card3_link, image: props.card3_image }
      ].filter(c => c && c.title && c.text);

      const cardsHtml = cards.map((card, index) => `
        <div class="card" data-card-index="${index}" style="background-color:${cardBackground};color:${cardTextColor};border-radius:${cardBorderRadius}px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);transition:all 0.2s ease;cursor:pointer;">
          ${card.image ? `<div class="card-image"><img src="${card.image}" alt="${card.title}" style="width:100%;height:200px;object-fit:cover;border-radius:4px;margin-bottom:15px;"/></div>` : ''}
          <h3 class="card-title" style="margin-bottom:10px;font-size:18px;font-weight:600;">${card.title}</h3>
          <p class="card-text" style="margin-bottom:15px;line-height:1.5;opacity:0.8;">${card.text}</p>
          ${card.button && card.link ? `<span class="card-button" style="display:inline-block;background-color:#007bff;color:#ffffff;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:14px;font-weight:500;transition:all 0.2s ease;">${card.button}</span>` : ''}
        </div>
      `).join('');

      // Сохраняем данные карточек в data-атрибуте для доступа из JS
      const cardsData = JSON.stringify(cards).replace(/"/g, '&quot;');

      return `
        <div class="card-list-block" data-cards='${cardsData}'>
          ${title ? `<h2 class="list-title" style="text-align:center;margin-bottom:30px;font-size:28px;font-weight:700;color:#333;">${title}</h2>` : ''}
          <div class="cards-container" style="display:grid;grid-template-columns:repeat(${isNaN(columns) ? 3 : columns},1fr);gap:${isNaN(gap) ? 16 : gap}px;padding:20px 0;">
            ${cardsHtml}
          </div>
        </div>
      `;
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок списка',
        type: 'text',
        placeholder: 'Наши услуги',
        rules: [
          { type: 'required', message: 'Заголовок обязателен' },
          { type: 'minLength', value: 1, message: 'Заголовок не может быть пустым' }
        ],
        defaultValue: 'Наши услуги'
      },
      {
        field: 'card1_title',
        label: 'Карточка 1 - Заголовок',
        type: 'text',
        placeholder: 'Веб-разработка',
        rules: [
          { type: 'required', message: 'Заголовок карточки обязателен' }
        ],
        defaultValue: 'Веб-разработка'
      },
      {
        field: 'card1_text',
        label: 'Карточка 1 - Описание',
        type: 'textarea',
        placeholder: 'Создание современных веб-приложений',
        rules: [
          { type: 'required', message: 'Описание карточки обязательно' }
        ],
        defaultValue: 'Создание современных веб-приложений'
      },
      {
        field: 'card1_button',
        label: 'Карточка 1 - Текст кнопки',
        type: 'text',
        placeholder: 'Подробнее',
        rules: [
          { type: 'required', message: 'Текст кнопки обязателен' }
        ],
        defaultValue: 'Подробнее'
      },
      {
        field: 'card1_link',
        label: 'Карточка 1 - Ссылка',
        type: 'url',
        placeholder: 'https://example.com',
        rules: [
          { type: 'required', message: 'Ссылка обязательна' }
        ],
        defaultValue: 'https://example.com'
      },
      {
        field: 'card1_image',
        label: 'Карточка 1 - Изображение',
        type: 'text',
        placeholder: 'https://example.com/image.jpg',
        rules: [
          { type: 'required', message: 'Изображение обязательно' }
        ],
        defaultValue: '../static-files/img/fwfw.jpg'
      },
      {
        field: 'card2_title',
        label: 'Карточка 2 - Заголовок',
        type: 'text',
        placeholder: 'Мобильные приложения',
        rules: [
          { type: 'required', message: 'Заголовок карточки обязателен' }
        ],
        defaultValue: 'Мобильные приложения'
      },
      {
        field: 'card2_text',
        label: 'Карточка 2 - Описание',
        type: 'textarea',
        placeholder: 'Разработка мобильных приложений для iOS и Android',
        rules: [
          { type: 'required', message: 'Описание карточки обязательно' }
        ],
        defaultValue: 'Разработка мобильных приложений для iOS и Android'
      },
      {
        field: 'card2_button',
        label: 'Карточка 2 - Текст кнопки',
        type: 'text',
        placeholder: 'Узнать больше',
        rules: [
          { type: 'required', message: 'Текст кнопки обязателен' }
        ],
        defaultValue: 'Узнать больше'
      },
      {
        field: 'card2_link',
        label: 'Карточка 2 - Ссылка',
        type: 'url',
        placeholder: 'https://example.com',
        rules: [
          { type: 'required', message: 'Ссылка обязательна' }
        ],
        defaultValue: 'https://example.com'
      },
      {
        field: 'card2_image',
        label: 'Карточка 2 - Изображение',
        type: 'text',
        placeholder: 'https://example.com/image.jpg',
        rules: [
          { type: 'required', message: 'Изображение обязательно' }
        ],
        defaultValue: '../static-files/img/fwfw.jpg'
      },
      {
        field: 'card3_title',
        label: 'Карточка 3 - Заголовок',
        type: 'text',
        placeholder: 'Дизайн',
        rules: [
          { type: 'required', message: 'Заголовок карточки обязателен' }
        ],
        defaultValue: 'Дизайн'
      },
      {
        field: 'card3_text',
        label: 'Карточка 3 - Описание',
        type: 'textarea',
        placeholder: 'Создание уникального дизайна для вашего бренда',
        rules: [
          { type: 'required', message: 'Описание карточки обязательно' }
        ],
        defaultValue: 'Создание уникального дизайна для вашего бренда'
      },
      {
        field: 'card3_button',
        label: 'Карточка 3 - Текст кнопки',
        type: 'text',
        placeholder: 'Посмотреть работы',
        rules: [
          { type: 'required', message: 'Текст кнопки обязателен' }
        ],
        defaultValue: 'Посмотреть работы'
      },
      {
        field: 'card3_link',
        label: 'Карточка 3 - Ссылка',
        type: 'url',
        placeholder: 'https://example.com',
        rules: [
          { type: 'required', message: 'Ссылка обязательна' }
        ],
        defaultValue: 'https://example.com'
      },
      {
        field: 'card3_image',
        label: 'Карточка 3 - Изображение',
        type: 'text',
        placeholder: 'https://example.com/image.jpg',
        rules: [
          { type: 'required', message: 'Изображение обязательно' }
        ],
        defaultValue: '../static-files/img/fwfw.jpg'
      },
      {
        field: 'cardBackground',
        label: 'Цвет фона карточек',
        type: 'color',
        rules: [
          { type: 'required', message: 'Цвет фона обязателен' }
        ],
        defaultValue: '#ffffff'
      },
      {
        field: 'cardTextColor',
        label: 'Цвет текста карточек',
        type: 'color',
        rules: [
          { type: 'required', message: 'Цвет текста обязателен' }
        ],
        defaultValue: '#333333'
      },
      {
        field: 'cardBorderRadius',
        label: 'Скругление карточек',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Скругление не может быть отрицательным' },
          { type: 'max', value: 50, message: 'Максимальное скругление: 50px' }
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
        rules: [
          { type: 'required', message: 'Количество колонок обязательно' }
        ],
        defaultValue: '3'
      },
      {
        field: 'gap',
        label: 'Отступ между карточками',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Отступ не может быть отрицательным' },
          { type: 'max', value: 50, message: 'Максимальный отступ: 50px' }
        ],
        defaultValue: 16
      }
    ]
  },

  gallerySlider: {
    title: 'Галерея со слайдером',
    icon: '🎠',
    description: 'Слайдер изображений с использованием Swiper.js',
    template: (props) => {
      const title = props.title || '';
      const autoplay = props.autoplay !== 'false' && props.autoplay !== false;
      const autoplayDelay = parseInt(props.autoplayDelay || '3000', 10);
      const loop = props.loop !== 'false' && props.loop !== false;
      const spaceBetween = parseInt(props.spaceBetween || '30', 10);

      const slides = [
        { url: props.image1_url, title: props.image1_title, description: props.image1_description },
        { url: props.image2_url, title: props.image2_title, description: props.image2_description },
        { url: props.image3_url, title: props.image3_title, description: props.image3_description },
        { url: props.image4_url, title: props.image4_title, description: props.image4_description }
      ].filter(s => s && s.url && s.title);

      const swiperId = `swiper-${Math.random().toString(36).substr(2, 9)}`;
      const swiperData = JSON.stringify({ autoplay, autoplayDelay, loop, spaceBetween }).replace(/"/g, '&quot;');

      const slidesHtml = slides.map(slide => `
        <div class="swiper-slide">
          <div style="position: relative; background: white;">
            <img src="${slide.url}" alt="${slide.title}" style="width: 100%; height: 400px; object-fit: cover; display: block;" />
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 30px 20px 20px; color: white;">
              <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">${slide.title}</h3>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">${slide.description}</p>
            </div>
          </div>
        </div>
      `).join('');

      return `
        <div class="gallery-slider-block" style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
          ${title ? `<h2 style="text-align: center; margin-bottom: 30px; font-size: 28px; font-weight: 700; color: #333;">${title}</h2>` : ''}
          
          <div id="${swiperId}" class="swiper" data-swiper-config='${swiperData}' style="width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div class="swiper-wrapper">
              ${slidesHtml}
            </div>
            
            <!-- Navigation -->
            <div class="swiper-button-next" style="color: white;"></div>
            <div class="swiper-button-prev" style="color: white;"></div>
            
            <!-- Pagination -->
            <div class="swiper-pagination"></div>
          </div>
        </div>
      `;
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок галереи',
        type: 'text',
        placeholder: 'Галерея изображений',
        rules: [
          { type: 'required', message: 'Заголовок обязателен' }
        ],
        defaultValue: 'Галерея изображений'
      },
      {
        field: 'image1_url',
        label: 'Изображение 1 - URL',
        type: 'text',
        placeholder: 'https://example.com/image1.jpg',
        rules: [
          { type: 'required', message: 'URL изображения обязателен' }
        ],
        defaultValue: '../static-files/img/fwfw.jpg'
      },
      {
        field: 'image1_title',
        label: 'Изображение 1 - Заголовок',
        type: 'text',
        placeholder: 'Заголовок изображения',
        rules: [
          { type: 'required', message: 'Заголовок обязателен' }
        ],
        defaultValue: 'Изображение 1'
      },
      {
        field: 'image1_description',
        label: 'Изображение 1 - Описание',
        type: 'textarea',
        placeholder: 'Описание изображения',
        rules: [
          { type: 'required', message: 'Описание обязательно' }
        ],
        defaultValue: 'Описание первого изображения в галерее'
      },
      {
        field: 'image2_url',
        label: 'Изображение 2 - URL',
        type: 'text',
        placeholder: 'https://example.com/image2.jpg',
        rules: [
          { type: 'required', message: 'URL изображения обязателен' }
        ],
        defaultValue: '../static-files/img/spanch.jpg'
      },
      {
        field: 'image2_title',
        label: 'Изображение 2 - Заголовок',
        type: 'text',
        placeholder: 'Заголовок изображения',
        rules: [
          { type: 'required', message: 'Заголовок обязателен' }
        ],
        defaultValue: 'Изображение 2'
      },
      {
        field: 'image2_description',
        label: 'Изображение 2 - Описание',
        type: 'textarea',
        placeholder: 'Описание изображения',
        rules: [
          { type: 'required', message: 'Описание обязательно' }
        ],
        defaultValue: 'Описание второго изображения в галерее'
      },
      {
        field: 'image3_url',
        label: 'Изображение 3 - URL',
        type: 'text',
        placeholder: 'https://example.com/image3.jpg',
        rules: [
          { type: 'required', message: 'URL изображения обязателен' }
        ],
        defaultValue: '../static-files/img/мэдвэд.jpg'
      },
      {
        field: 'image3_title',
        label: 'Изображение 3 - Заголовок',
        type: 'text',
        placeholder: 'Заголовок изображения',
        rules: [
          { type: 'required', message: 'Заголовок обязателен' }
        ],
        defaultValue: 'Изображение 3'
      },
      {
        field: 'image3_description',
        label: 'Изображение 3 - Описание',
        type: 'textarea',
        placeholder: 'Описание изображения',
        rules: [
          { type: 'required', message: 'Описание обязательно' }
        ],
        defaultValue: 'Описание третьего изображения в галерее'
      },
      {
        field: 'image4_url',
        label: 'Изображение 4 - URL',
        type: 'text',
        placeholder: 'https://example.com/image4.jpg',
        rules: [
          { type: 'required', message: 'URL изображения обязателен' }
        ],
        defaultValue: '../static-files/img/Квантовое_4D-кодирование_картинка.jpg'
      },
      {
        field: 'image4_title',
        label: 'Изображение 4 - Заголовок',
        type: 'text',
        placeholder: 'Заголовок изображения',
        rules: [
          { type: 'required', message: 'Заголовок обязателен' }
        ],
        defaultValue: 'Изображение 4'
      },
      {
        field: 'image4_description',
        label: 'Изображение 4 - Описание',
        type: 'textarea',
        placeholder: 'Описание изображения',
        rules: [
          { type: 'required', message: 'Описание обязательно' }
        ],
        defaultValue: 'Описание четвёртого изображения в галерее'
      },
      {
        field: 'autoplay',
        label: 'Автоматическая прокрутка',
        type: 'checkbox',
        defaultValue: true
      },
      {
        field: 'autoplayDelay',
        label: 'Задержка автопрокрутки (мс)',
        type: 'number',
        rules: [
          { type: 'min', value: 1000, message: 'Минимум 1000 мс' },
          { type: 'max', value: 10000, message: 'Максимум 10000 мс' }
        ],
        defaultValue: 3000
      },
      {
        field: 'loop',
        label: 'Бесконечная прокрутка',
        type: 'checkbox',
        defaultValue: true
      },
      {
        field: 'spaceBetween',
        label: 'Отступ между слайдами (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Минимум 0 px' },
          { type: 'max', value: 100, message: 'Максимум 100 px' }
        ],
        defaultValue: 30
      }
    ]
  },

  timelapse: {
    title: '⏱️ Таймлапс с этапами',
    icon: '⏱️',
    description: 'Таймер с последовательными этапами и обратным отсчетом',
    render: {
      kind: 'custom',
      mount: function(container, props) {
        const stages = props.stages || []
        const blockId = 'timelapse-' + Math.random().toString(36).substr(2, 9)
        
        // Создаем HTML
        container.innerHTML = 
          '<div class="timelapse-block" id="' + blockId + '">' +
            (props.title ? '<h2 class="timelapse-block__title">' + props.title + '</h2>' : '') +
            '<div class="timelapse-block__content">' +
              '<div class="timelapse-block__stages" data-stages-container>' +
                stages.map(function(stage, index) {
                  return '<div class="timelapse-block__stage" data-stage-index="' + index + '">' +
                    '<div class="timelapse-block__stage-number">' + (index + 1) + '</div>' +
                    '<div class="timelapse-block__stage-content">' +
                      '<div class="timelapse-block__stage-name">' + (stage.name || 'Этап ' + (index + 1)) + '</div>' +
                      '<div class="timelapse-block__stage-duration">' + (stage.duration || 0) + ' сек</div>' +
                    '</div>' +
                    '<div class="timelapse-block__stage-check" style="display: none;">✓</div>' +
                  '</div>'
                }).join('') +
              '</div>' +
              '<div class="timelapse-block__timer-panel">' +
                '<div class="timelapse-block__timer">' +
                  '<div class="timelapse-block__timer-value" data-timer-value>00:00</div>' +
                  '<div class="timelapse-block__timer-label">до следующего этапа</div>' +
                '</div>' +
                '<div class="timelapse-block__current-stage" data-current-stage>' +
                  '<div class="timelapse-block__current-label">Текущий этап:</div>' +
                  '<div class="timelapse-block__current-name" data-current-name>Нажмите "Старт"</div>' +
                '</div>' +
                '<div class="timelapse-block__progress">' +
                  '<div class="timelapse-block__progress-bar" data-progress-bar style="width: 0%"></div>' +
                '</div>' +
                '<div class="timelapse-block__controls">' +
                  '<button class="timelapse-block__btn timelapse-block__btn--start" data-start-btn>Старт</button>' +
                  '<button class="timelapse-block__btn timelapse-block__btn--pause" data-pause-btn style="display: none;">Пауза</button>' +
                  '<button class="timelapse-block__btn timelapse-block__btn--reset" data-reset-btn>Сброс</button>' +
                '</div>' +
                '<div class="timelapse-block__completed" data-completed style="display: none;">🎉 Все этапы завершены!</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<style>' +
            '.timelapse-block { padding: 20px; background: #f5f5f5; border-radius: 12px; }' +
            '.timelapse-block__title { margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #333; text-align: center; }' +
            '.timelapse-block__content { display: flex; gap: 30px; align-items: flex-start; }' +
            '.timelapse-block__stages { flex: 1; display: flex; flex-direction: column; gap: 12px; }' +
            '.timelapse-block__stage { display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border-radius: 8px; border: 2px solid #e0e0e0; transition: all 0.3s ease; }' +
            '.timelapse-block__stage--active { border-color: #4CAF50; background: #f1f8f4; box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2); }' +
            '.timelapse-block__stage--completed { border-color: #2196F3; background: #e3f2fd; }' +
            '.timelapse-block__stage-number { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: #e0e0e0; border-radius: 50%; font-weight: 700; color: #666; flex-shrink: 0; }' +
            '.timelapse-block__stage--active .timelapse-block__stage-number { background: #4CAF50; color: white; }' +
            '.timelapse-block__stage--completed .timelapse-block__stage-number { background: #2196F3; color: white; }' +
            '.timelapse-block__stage-content { flex: 1; }' +
            '.timelapse-block__stage-name { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px; }' +
            '.timelapse-block__stage-duration { font-size: 13px; color: #666; }' +
            '.timelapse-block__stage-check { font-size: 24px; color: #2196F3; flex-shrink: 0; }' +
            '.timelapse-block__timer-panel { flex: 1; display: flex; flex-direction: column; gap: 20px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }' +
            '.timelapse-block__timer { text-align: center; }' +
            '.timelapse-block__timer-value { font-size: 64px; font-weight: 700; color: #4CAF50; font-family: "Courier New", monospace; letter-spacing: 4px; }' +
            '.timelapse-block__timer-label { font-size: 14px; color: #666; margin-top: 8px; }' +
            '.timelapse-block__current-stage { text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px; }' +
            '.timelapse-block__current-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }' +
            '.timelapse-block__current-name { font-size: 20px; font-weight: 600; color: #333; }' +
            '.timelapse-block__progress { width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; }' +
            '.timelapse-block__progress-bar { height: 100%; background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%); transition: width 1s linear; }' +
            '.timelapse-block__controls { display: flex; gap: 12px; justify-content: center; }' +
            '.timelapse-block__btn { padding: 12px 24px; font-size: 16px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; min-width: 120px; }' +
            '.timelapse-block__btn--start { background: #4CAF50; color: white; }' +
            '.timelapse-block__btn--start:hover { background: #45a049; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3); }' +
            '.timelapse-block__btn--pause { background: #FF9800; color: white; }' +
            '.timelapse-block__btn--pause:hover { background: #F57C00; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3); }' +
            '.timelapse-block__btn--reset { background: #f44336; color: white; }' +
            '.timelapse-block__btn--reset:hover { background: #d32f2f; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3); }' +
            '.timelapse-block__completed { text-align: center; font-size: 24px; font-weight: 700; color: #4CAF50; padding: 20px; background: #f1f8f4; border-radius: 8px; }' +
            '@media (max-width: 768px) { .timelapse-block__content { flex-direction: column; } .timelapse-block__timer-value { font-size: 48px; } .timelapse-block__controls { flex-direction: column; } .timelapse-block__btn { width: 100%; } }' +
          '</style>'
        
        // Инициализация логики после рендера HTML
        setTimeout(function() {
          const blockEl = container.querySelector('#' + blockId)
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
              const elapsed = stages[currentStageIndex].duration - timeLeft
              const percentage = (elapsed / stages[currentStageIndex].duration) * 100
              progressBar.style.width = percentage + '%'
            } else {
              currentName.textContent = 'Нажмите "Старт"'
              progressBar.style.width = '0%'
            }
            
            stageElements.forEach(function(el, index) {
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
            
            intervalId = setInterval(function() {
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
};

// Шаблоны рендеринга предоставляет пакет
// Пользователь не должен создавать шаблоны - это делает пакет
