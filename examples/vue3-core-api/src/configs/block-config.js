/**
 * Конфигурация пользовательских блоков
 * Используется с core API пакета
 */

import TextBlock from '../components/blocks/TextBlock.vue'
import ImageBlock from '../components/blocks/ImageBlock.vue'
import CardBlock from '../components/blocks/CardBlock.vue'
import HeroBlock from '../components/blocks/HeroBlock.vue'

export const blockConfigs = {
  text: {
    title: 'Текстовый блок',
    icon: '',
    description: 'Простой текстовый блок',
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
        defaultValue: 'Новый текстовый блок'
      },
      {
        field: 'fontSize',
        label: 'Размер шрифта',
        type: 'number',
        defaultValue: 16
      },
      {
        field: 'color',
        label: 'Цвет',
        type: 'color',
        defaultValue: '#333333'
      }
    ]
  },
  image: {
    title: 'Блок изображения',
    icon: '',
    description: 'Простой блок с изображением',
    render: {
      kind: 'component',
      framework: 'vue',
      component: ImageBlock
    },
    fields: [
      {
        field: 'image',
        label: 'Изображение',
        type: 'image',
        defaultValue: ''
      },
      {
        field: 'alt',
        label: 'Описание',
        type: 'text',
        defaultValue: 'Изображение'
      }
    ]
  },
  card: {
    title: 'Карточка',
    icon: '',
    description: 'Блок-карточка с заголовком и текстом',
    render: {
      kind: 'component',
      framework: 'vue',
      component: CardBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        defaultValue: 'Заголовок карточки'
      },
      {
        field: 'description',
        label: 'Описание',
        type: 'textarea',
        defaultValue: 'Описание карточки'
      },
      {
        field: 'bgColor',
        label: 'Цвет фона',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        field: 'borderColor',
        label: 'Цвет рамки',
        type: 'color',
        defaultValue: '#dddddd'
      }
    ]
  },
  hero: {
    title: 'Hero секция',
    icon: '',
    description: 'Главная секция с текстом',
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
        defaultValue: 'Заголовок Hero'
      },
      {
        field: 'subtitle',
        label: 'Подзаголовок',
        type: 'text',
        defaultValue: 'Подзаголовок Hero'
      },
      {
        field: 'bgImage',
        label: 'Фоновое изображение',
        type: 'image',
        defaultValue: ''
      }
    ]
  }
}

