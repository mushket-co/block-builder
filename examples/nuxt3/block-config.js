/**
 * Block configuration — full set as in examples/vue3
 */


import TextBlock from '~/components/blocks/TextBlock.vue'
import ButtonBlock from '~/components/blocks/ButtonBlock.vue'
import RichCardListBlock from '~/components/blocks/RichCardListBlock.vue'
import NewsListBlock from '~/components/blocks/NewsListBlock.vue'
import RichTextBlock from '~/components/blocks/RichTextBlock.vue'
import LinkBlock from '~/components/blocks/LinkBlock.vue'
import ToggleRepeaterBlock from '~/components/blocks/ToggleRepeaterBlock.vue'
import NestedRepeaterBlock from '~/components/blocks/NestedRepeaterBlock.vue'
import { createNestedRepeaterBlockConfig } from '../../shared/nestedRepeaterBlockConfig.js'
import TableBlock from '~/components/blocks/TableBlock.vue'

const TABLE_MATRIX_UPLOAD_CONFIG = {
  uploadUrl: '/api/upload',
  fileParamName: 'file',
  maxFileSize: 5 * 1024 * 1024,
  responseMapper: response => response.data?.url || response.url || '',
}

const DEFAULT_TABLE_MATRIX = {
  tableHead: [
    { id: 'col-name', type: 'default', name: 'Name', nowrap: false, size: '' },
    { id: 'col-desc', type: 'wyz', name: 'Description', nowrap: false, size: 'normal' },
    { id: 'col-status', type: 'default', name: 'Status', nowrap: true, size: 'small' },
  ],
  tableBody: [
    {
      id: 'row-1',
      fields: [
        { id: 'c-1-1', value: 'Block Builder', image: '' },
        { id: 'c-1-2', value: '<p>Demo of the <strong>matrix-table</strong> field</p>', image: '' },
        { id: 'c-1-3', value: 'Demo', image: '' },
      ],
    },
    {
      id: 'row-2',
      fields: [
        { id: 'c-2-1', value: 'Vue / React', image: '' },
        { id: 'c-2-2', value: '<p>Cell type is defined by the column, not the row</p>', image: '' },
        { id: 'c-2-3', value: 'OK', image: '' },
      ],
    },
  ],
}

function createTableBlockFields() {
  return [
    {
      field: 'title',
      label: 'Block title',
      type: 'text',
      defaultValue: 'Table (matrix-table)',
    },
    {
      field: 'showTableHead',
      label: 'Show table header',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      field: 'gapSize',
      label: 'Cell padding',
      type: 'radio',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'big', label: 'Large' },
      ],
      defaultValue: 'small',
    },
    {
      field: 'tableMatrix',
      label: 'Table',
      type: 'matrix-table',
      rules: [{ type: 'required', message: 'Fill in the table structure' }],
      defaultValue: DEFAULT_TABLE_MATRIX,
      matrixTableConfig: {
        imageUploadConfig: TABLE_MATRIX_UPLOAD_CONFIG,
      },
    },
  ]
}

function createTableBlockConfig({ component, framework }) {
  return {
    title: 'Table (matrix-table)',
    icon: '/icons/table.svg',
    description: 'Table: columns and rows are edited via the matrix-table field',
    render: {
      kind: 'component',
      framework,
      component,
    },
    fields: createTableBlockFields(),
  }
}



export const blockConfigs = {
  richText: {
    title: 'Rich Text (with visual editor)',
    icon: '/icons/rich-text.svg',
    description: 'Block with Jodit visual editor for formatted text',
    render: {
      kind: 'component',
      framework: 'vue',
      component: RichTextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Content',
        type: 'custom', // ✅ Using custom field type
        customFieldConfig: {
          rendererId: 'wysiwyg-editor', // ID of registered renderer
          options: {
            mode: 'default' // Editor options
          }
        },
        rules: [
          { type: 'required', message: 'Content is required' }
        ],
        defaultValue: '<p>Enter your text here...</p>'
      },
      {
        field: 'fontSize',
        label: 'Font size',
        type: 'number',
        rules: [
          { type: 'required', message: 'Font size is required' },
          { type: 'min', value: 12, message: 'Minimum size: 12px' },
          { type: 'max', value: 48, message: 'Maximum size: 48px' }
        ],
        defaultValue: 16
      },
      {
        field: 'textColor',
        label: 'Text color',
        type: 'color',
        rules: [{ type: 'required', message: 'Color is required' }],
        defaultValue: '#333333'
      },
      {
        field: 'textAlign',
        label: 'Alignment',
        type: 'select',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justify' }
        ],
        rules: [{ type: 'required', message: 'Alignment is required' }],
        defaultValue: 'left'
      }
    ]
  },

  text: {
    title: 'Text block (simple)',
    icon: '/icons/text.svg',
    description: 'Add text content to the page',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Text',
        type: 'textarea',
        placeholder: 'Enter your text...',
        rules: [
          { type: 'required', message: 'Text is required' }
        ],
        defaultValue: ''
      },
      {
        field: 'fontSize',
        label: 'Font size',
        type: 'number',
        rules: [
          { type: 'required', message: 'Font size is required' },
          { type: 'min', value: 8, message: 'Minimum size: 8px' },
          { type: 'max', value: 72, message: 'Maximum size: 72px' }
        ],
        defaultValue: 16
      },
      {
        field: 'color',
        label: 'Text color',
        type: 'color',
        rules: [{ type: 'required', message: 'Color is required' }],
        defaultValue: '#333333'
      },
      {
        field: 'textAlign',
        label: 'Alignment',
        type: 'select',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ],
        rules: [{ type: 'required', message: 'Alignment is required' }],
        defaultValue: 'left'
      },
      {
        field: 'topics',
        label: 'Topics (select, multiple)',
        type: 'select',
        multiple: true,
        options: [
          { value: 'dev', label: 'Development' },
          { value: 'design', label: 'Design' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'analytics', label: 'Analytics' }
        ],
        rules: [],
        defaultValue: ['dev', 'design']
      },
      {
        field: 'image',
        label: 'Image (single)',
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
        label: 'Images (multiple)',
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
        label: 'File (single)',
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
        label: 'Files (multiple)',
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
    // 🧪 Custom breakpoints for testing
    spacingOptions: {
      config: {
        min: 0,
        max: 120,
        step: 8,
        // Custom breakpoints (when specified, replace defaults)
        breakpoints: [
          { name: 'xlarge', label: 'XL (Desktop)', maxWidth: undefined }, // Desktop without limit
          { name: 'large', label: 'L (Laptop)', maxWidth: 1440 },
          { name: 'medium', label: 'M (Tablet)', maxWidth: 1024 },
          { name: 'small', label: 'S (Mobile)', maxWidth: 640 }
        ]
      }
    }
  },

  richCardList: {
    title: 'Rich cards',
    icon: '/icons/card.svg',
    description: 'Test block with many fields in each card',
    render: {
      kind: 'component',
      framework: 'vue',
      component: RichCardListBlock
    },
    fields: [
      {
        field: 'sectionTitle',
        label: 'Section title',
        type: 'text',
        placeholder: 'Our products',
        rules: [
          { type: 'required', message: 'Section title is required' },
          { type: 'minLength', value: 3, message: 'Minimum length: 3 characters' },
          { type: 'maxLength', value: 100, message: 'Maximum length: 100 characters' }
        ],
        defaultValue: 'Our products'
      },
      {
        field: 'titleColor',
        label: 'Section title color',
        type: 'color',
        rules: [{ type: 'required', message: 'Title color is required' }],
        defaultValue: '#333333'
      },
      {
        field: 'titleSize',
        label: 'Section title size (px)',
        type: 'number',
        rules: [
          { type: 'required', message: 'Title size is required' },
          { type: 'min', value: 16, message: 'Minimum: 16px' },
          { type: 'max', value: 72, message: 'Maximum: 72px' }
        ],
        defaultValue: 32
      },
      {
        field: 'titleAlign',
        label: 'Title alignment',
        type: 'select',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ],
        rules: [{ type: 'required', message: 'Title alignment is required' }],
        defaultValue: 'center'
      },

      {
        field: 'cards',
        label: 'Cards',
        type: 'repeater',
        defaultValue: [
          {
            title: 'Premium product',
            subtitle: 'Best solution 2024',
            text: 'Innovative product with cutting-edge technology for your business',
            detailedText: 'Full description includes all features and benefits of this product. Ideal for small and medium businesses.',
            link: 'https://example.com/product-1',
            linkTarget: '_blank',
            buttonText: 'Learn more',
            image: '',
            imageMobile: '',
            imageAlt: 'Premium product',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            meetingPlace: 'Conference room "Alpha", Business Center "Capital"',
            meetingTime: '3:00 PM, October 25, 2024',
            participantsCount: '50',
            relatedArticle: null
          },
          {
            title: 'Standard edition',
            subtitle: 'Optimal choice',
            text: 'Proven solution for everyday tasks with excellent value for money',
            detailedText: 'Includes essential functionality for efficient work. Easily scales as your business grows.',
            link: 'https://example.com/product-2',
            linkTarget: '_self',
            buttonText: 'Details',
            image: '',
            imageMobile: '',
            imageAlt: 'Standard edition',
            backgroundColor: '#f8f9fa',
            textColor: '#212529',
            meetingPlace: 'Company office, 3rd floor',
            meetingTime: '10:30 AM, October 26, 2024',
            participantsCount: '25',
            relatedArticle: null
          },
          {
            title: 'Enterprise solution',
            subtitle: 'For large businesses',
            text: 'Scalable solution with advanced features for enterprise level',
            detailedText: 'Full customization, integration with existing systems, priority 24/7 technical support.',
            link: 'https://example.com/product-3',
            linkTarget: '_blank',
            buttonText: 'Contact us',
            image: '',
            imageMobile: '',
            imageAlt: 'Enterprise solution',
            backgroundColor: '#e7f3ff',
            textColor: '#004085',
            meetingPlace: 'Metropol Hotel, Premier Hall',
            meetingTime: '2:00 PM, October 27, 2024',
            participantsCount: '100',
            relatedArticle: null
          }
        ],
        repeaterConfig: {
          itemTitle: 'Card',
          addButtonText: 'Add card',
          removeButtonText: 'Remove',
          min: 2,
          max: 20,
          fields: [
            {
              field: 'title',
              label: 'Title',
              type: 'text',
              placeholder: 'Product name',
              rules: [
                { type: 'required', message: 'Title is required' },
                { type: 'minLength', value: 3, message: 'Minimum length: 3 characters' },
                { type: 'maxLength', value: 100, message: 'Maximum length: 100 characters' }
              ],
              defaultValue: ''
            },
            {
              field: 'subtitle',
              label: 'Subtitle',
              type: 'text',
              placeholder: 'Short description',
              rules: [
                { type: 'required', message: 'Subtitle is required' },
                { type: 'minLength', value: 5, message: 'Minimum length: 5 characters' },
                { type: 'maxLength', value: 150, message: 'Maximum length: 150 characters' }
              ],
              defaultValue: ''
            },
            {
              field: 'text',
              label: 'Main text',
              type: 'textarea',
              placeholder: 'Main product description...',
              rules: [
                { type: 'required', message: 'Main text is required' },
                { type: 'minLength', value: 10, message: 'Minimum length: 10 characters' },
                { type: 'maxLength', value: 500, message: 'Maximum length: 500 characters' }
              ],
              defaultValue: ''
            },
            {
              field: 'detailedText',
              label: 'Detailed description',
              type: 'custom',
              rules: [
                { type: 'required', message: 'Detailed description is required' },
                { type: 'minLength', value: 20, message: 'Minimum length: 20 characters' }
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
              label: 'Link',
              type: 'text',
              placeholder: '/news/123/ or https://example.com',
              rules: [
                { type: 'required', message: 'Link is required' },
                { type: 'minLength', value: 1, message: 'Link cannot be empty' }
              ],
              defaultValue: ''
            },
            {
              field: 'linkTarget',
              label: 'Link target',
              type: 'select',
              options: [
                { value: '_self', label: 'Same tab' },
                { value: '_blank', label: 'New tab' }
              ],
              rules: [{ type: 'required', message: 'Link target is required' }],
              defaultValue: '_blank'
            },
            {
              field: 'buttonText',
              label: 'Button text',
              type: 'text',
              placeholder: 'Learn more',
              rules: [
                { type: 'required', message: 'Button text is required' },
                { type: 'minLength', value: 2, message: 'Minimum length: 2 characters' },
                { type: 'maxLength', value: 50, message: 'Maximum length: 50 characters' }
              ],
              defaultValue: 'Learn more'
            },
            {
              field: 'image',
              label: 'Image (desktop)',
              type: 'image',
              rules: [{ type: 'required', message: 'Desktop image is required' }],
              defaultValue: ''
            },
            {
              field: 'imageMobile',
              label: 'Image (mobile)',
              type: 'image',
              rules: [{ type: 'required', message: 'Mobile image is required' }],
              defaultValue: ''
            },
            {
              field: 'imageAlt',
              label: 'Image alt text',
              type: 'text',
              placeholder: 'Image description for accessibility',
              rules: [
                { type: 'required', message: 'Alt text is required' },
                { type: 'minLength', value: 3, message: 'Minimum length: 3 characters' },
                { type: 'maxLength', value: 200, message: 'Maximum length: 200 characters' }
              ],
              defaultValue: ''
            },
            {
              field: 'backgroundColor',
              label: 'Card background color',
              type: 'color',
              rules: [{ type: 'required', message: 'Background color is required' }],
              defaultValue: '#ffffff'
            },
            {
              field: 'textColor',
              label: 'Card text color',
              type: 'color',
              rules: [{ type: 'required', message: 'Text color is required' }],
              defaultValue: '#333333'
            },
            {
              field: 'meetingPlace',
              label: 'Meeting place',
              type: 'text',
              placeholder: 'Conference room, office...',
              rules: [
                { type: 'required', message: 'Meeting place is required' },
                { type: 'minLength', value: 5, message: 'Minimum length: 5 characters' },
                { type: 'maxLength', value: 200, message: 'Maximum length: 200 characters' }
              ],
              defaultValue: ''
            },
            {
              field: 'meetingTime',
              label: 'Meeting time',
              type: 'text',
              placeholder: '3:00 PM, October 25, 2024',
              rules: [
                { type: 'required', message: 'Meeting time is required' },
                { type: 'minLength', value: 5, message: 'Minimum length: 5 characters' },
                { type: 'maxLength', value: 100, message: 'Maximum length: 100 characters' }
              ],
              defaultValue: ''
            },
            {
              field: 'participantsCount',
              label: 'Number of participants',
              type: 'number',
              placeholder: '50',
              rules: [
                { type: 'required', message: 'Number of participants is required' },
                { type: 'min', value: 1, message: 'Minimum 1 participant' },
                { type: 'max', value: 10000, message: 'Maximum 10000 participants' }
              ],
              defaultValue: ''
            },
            {
              field: 'relatedArticle',
              label: 'Related article',
              type: 'api-select',
              rules: [{ type: 'required', message: 'Related article is required' }],
              defaultValue: null,
              apiSelectConfig: {
                url: '/api/articles',
                searchParam: 'search',
                pageParam: 'page',
                limitParam: 'limit',
                placeholder: 'Select article',
                noResultsText: 'No articles found',
                loadingText: 'Loading articles...',
                errorText: 'Failed to load articles',
                limit: 10,
                multiple: false
              }
            },
          ]
        }
      },

      // General display settings
      {
        field: 'cardMinWidth',
        label: 'Minimum card width (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 200, message: 'Minimum: 200px' },
          { type: 'max', value: 600, message: 'Maximum: 600px' }
        ],
        defaultValue: 300
      },
      {
        field: 'gap',
        label: 'Gap between cards (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Minimum: 0px' },
          { type: 'max', value: 100, message: 'Maximum: 100px' }
        ],
        defaultValue: 24
      },
      {
        field: 'cardDefaultBg',
        label: 'Default card background color',
        type: 'color',
        rules: [],
        defaultValue: '#ffffff'
      },
      {
        field: 'cardDefaultTextColor',
        label: 'Default card text color',
        type: 'color',
        rules: [],
        defaultValue: '#333333'
      },
      {
        field: 'cardBorderRadius',
        label: 'Card border radius (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Minimum: 0px' },
          { type: 'max', value: 50, message: 'Maximum: 50px' }
        ],
        defaultValue: 12
      },
      {
        field: 'cardShadow',
        label: 'Card shadow',
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: '0 2px 8px rgba(0, 0, 0, 0.08)', label: 'Light' },
          { value: '0 4px 12px rgba(0, 0, 0, 0.1)', label: 'Medium' },
          { value: '0 8px 24px rgba(0, 0, 0, 0.15)', label: 'Strong' }
        ],
        rules: [],
        defaultValue: '0 4px 12px rgba(0, 0, 0, 0.1)'
      },
      {
        field: 'buttonColor',
        label: 'Button color',
        type: 'color',
        rules: [],
        defaultValue: '#667eea'
      },
      {
        field: 'buttonTextColor',
        label: 'Button text color',
        type: 'color',
        rules: [],
        defaultValue: '#ffffff'
      },
      {
        field: 'buttonBorderRadius',
        label: 'Button border radius (px)',
        type: 'number',
        rules: [
          { type: 'min', value: 0, message: 'Minimum: 0px' },
          { type: 'max', value: 50, message: 'Maximum: 50px' }
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
    title: 'News list from API',
    icon: '/icons/text.svg',
    description: 'Block displaying news selected via API',
    render: {
      kind: 'component',
      framework: 'vue',
      component: NewsListBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Section title',
        type: 'text',
        placeholder: 'Latest news',
        rules: [{ type: 'required', message: 'Title is required' }],
        defaultValue: 'Latest news'
      },
      // ✅ EXAMPLE: API-SELECT with single selection
      {
        field: 'featuredNewsId',
        label: 'Featured news',
        type: 'api-select',
        rules: [{ type: 'required', message: 'Select featured news' }],
        defaultValue: null,
        apiSelectConfig: {
          url: '/api/news',
          method: 'GET',
          multiple: false, // Single selection
          placeholder: 'Start typing to search news...',
          searchParam: 'search',
          pageParam: 'page',
          limitParam: 'limit',
          limit: 10,
          debounceMs: 1500,
          idField: 'id',
          nameField: 'name',
          minSearchLength: 0,
          loadingText: 'Loading news...',
          noResultsText: 'No news found',
          errorText: 'Failed to load news'
        }
      },
      // ✅ EXAMPLE: API-SELECT with multiple selection
      {
        field: 'newsIds',
        label: 'News list to display',
        type: 'api-select',
        rules: [{ type: 'required', message: 'Select at least one news item' }],
        defaultValue: [],
        apiSelectConfig: {
          url: '/api/news',
          method: 'GET',
          multiple: true, // Multiple selection
          placeholder: 'Select news...',
          limit: 10,
          debounceMs: 1500,
          loadingText: 'Loading...',
          noResultsText: 'Nothing found',
          errorText: 'Failed to load'
        }
      },
      // Display settings
      {
        field: 'showDate',
        label: 'Show date',
        type: 'checkbox',
        rules: [],
        defaultValue: true
      },
      {
        field: 'columns',
        label: 'Number of columns',
        type: 'select',
        options: [
          { value: '1', label: '1 column' },
          { value: '2', label: '2 columns' },
          { value: '3', label: '3 columns' }
        ],
        rules: [],
        defaultValue: '2'
      },
      {
        field: 'backgroundColor',
        label: 'Background color',
        type: 'color',
        rules: [],
        defaultValue: '#f8f9fa'
      },
      {
        field: 'textColor',
        label: 'Text color',
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
    title: 'Link block',
    icon: '/icons/button.svg',
    description: 'Block with link, open target, and background',
    render: {
      kind: 'component',
      framework: 'vue',
      component: LinkBlock
    },
    fields: [
      {
        field: 'text',
        label: 'Link text',
        type: 'text',
        placeholder: 'Enter link text',
        rules: [
          { type: 'required', message: 'Link text is required' }
        ],
        defaultValue: 'Go'
      },
      {
        field: 'url',
        label: 'Anchor or URL',
        type: 'block-anchor',
        blockAnchorConfig: {
          placeholder: 'Select block on page',
          allowCustomUrl: true
        },
        rules: [
          { type: 'required', message: 'Specify anchor or URL' }
        ],
        defaultValue: ''
      },
      {
        field: 'linkTarget',
        label: 'How to open link',
        type: 'radio',
        options: [
          { value: '_self', label: 'Same tab' },
          { value: '_blank', label: 'New tab' }
        ],
        rules: [
          { type: 'required', message: 'Select open method' }
        ],
        defaultValue: '_self'
      },
      {
        field: 'hasBackground',
        label: 'Add block background',
        type: 'checkbox',
        defaultValue: false
      },
      {
        field: 'backgroundColor',
        label: 'Background color',
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

  table: createTableBlockConfig({ component: TableBlock, framework: 'vue' }),

  toggleRepeater: {
    title: 'Toggle + Repeater (regression)',
    icon: '/icons/button.svg',
    description: 'Regression test: repeater inside toggle-group (checkbox + dependsOn)',
    render: {
      kind: 'component',
      framework: 'vue',
      component: ToggleRepeaterBlock
    },
    fields: [
      {
        field: 'showLogos',
        label: 'Main logos',
        type: 'checkbox',
        defaultValue: false
      },
      {
        field: 'logos',
        label: 'Logos',
        type: 'repeater',
        dependsOn: { field: 'showLogos', value: true },
        repeaterConfig: {
          itemTitle: 'Logo',
          addButtonText: 'Add logo',
          min: 1,
          fields: [
            {
              field: 'name',
              label: 'Name',
              type: 'text',
              defaultValue: '',
              rules: [{ type: 'required', message: 'Name is required' }]
            },
            {
              field: 'url',
              label: 'URL',
              type: 'url',
              defaultValue: ''
            }
          ],
          defaultItemValue: { name: '', url: '' }
        },
        defaultValue: [{ name: '', url: '' }]
      },
      {
        field: 'showLinks',
        label: 'Links',
        type: 'checkbox',
        defaultValue: false
      },
      {
        field: 'links',
        label: 'Links',
        type: 'repeater',
        dependsOn: { field: 'showLinks', value: true },
        repeaterConfig: {
          itemTitle: 'Link',
          addButtonText: 'Add link',
          min: 1,
          fields: [
            {
              field: 'name',
              label: 'Text',
              type: 'text',
              defaultValue: '',
              rules: [{ type: 'required', message: 'Text is required' }]
            },
            {
              field: 'url',
              label: 'URL',
              type: 'url',
              defaultValue: '',
              rules: [{ type: 'required', message: 'URL is required' }]
            }
          ],
          defaultItemValue: { name: '', url: '' }
        },
        defaultValue: [{ name: '', url: '' }]
      }
    ]
  },

  nestedRepeater: createNestedRepeaterBlockConfig({
    component: NestedRepeaterBlock,
    framework: 'vue',
    locale: 'en',
  }),
}
