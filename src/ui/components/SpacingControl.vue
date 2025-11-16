<template>
  <div class="bb-spacing-control">
    <div class="bb-spacing-control__header">
      <label class="bb-spacing-control__label">
        {{ label }}
        <span v-if="required" class="bb-required">*</span>
      </label>
    </div>

    <div v-if="showAdvancedSpacingRestriction" class="bb-warning-box bb-mb-sm">
      ⚠️ {{ getAdvancedSpacingRestrictionMessage() }}
    </div>

    <div class="bb-spacing-control__breakpoints">
      <button
        v-for="bp in allBreakpoints"
        :key="bp.name"
        type="button"
        class="bb-spacing-control__breakpoint-btn"
        :class="{ 'bb-spacing-control__breakpoint-btn--active': currentBreakpoint === bp.name }"
        @click="currentBreakpoint = bp.name"
      >
        {{ bp.label }}
      </button>
    </div>

    <div class="bb-spacing-control__groups">
      <div
        v-for="spacingType in availableSpacingTypes"
        :key="spacingType"
        class="bb-spacing-control__group"
      >
        <label :for="getFieldId(spacingType)" class="bb-spacing-control__group-label">
          {{ getSpacingLabel(spacingType) }}
        </label>

        <div class="bb-spacing-control__slider-wrapper">
          <input
            :id="getFieldId(spacingType)"
            type="range"
            class="bb-spacing-control__slider"
            :min="minValue"
            :max="maxValue"
            :step="stepValue"
            :value="getSpacingValue(spacingType)"
            @input="handleSpacingChange(spacingType, $event)"
          />
          <input
            type="number"
            class="bb-spacing-control__value-input"
            :min="minValue"
            :max="maxValue"
            :step="stepValue"
            :value="getSpacingValue(spacingType)"
            @input="handleValueInputChange(spacingType, $event)"
          />
          <span class="bb-spacing-control__unit">px</span>
        </div>
      </div>
    </div>

    <div v-if="showPreview" class="bb-spacing-control__preview">
      <div class="bb-spacing-control__preview-title">CSS переменные:</div>
      <pre class="bb-spacing-control__preview-code">{{ getCSSVariablesPreview() }}</pre>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';

import { LicenseFeature } from '../../core/services/LicenseFeatureChecker';

const DEFAULT_BREAKPOINTS = [
  { name: 'desktop', label: 'Десктоп', maxWidth: undefined },
  { name: 'tablet', label: 'Таблет', maxWidth: 1199 },
  { name: 'mobile', label: 'Моб', maxWidth: 767 },
];

const ALL_SPACING_TYPES = ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom'];

export default {
  name: 'SpacingControl',
  props: {
    label: {
      type: String,
      default: 'Отступы',
    },

    fieldName: {
      type: String,
      required: true,
    },

    modelValue: {
      type: Object,
      default: () => ({}),
    },

    spacingTypes: {
      type: Array,
      default: () => ALL_SPACING_TYPES,
    },

    min: {
      type: Number,
      default: 0,
    },

    max: {
      type: Number,
      default: 200,
    },

    step: {
      type: Number,
      default: 1,
    },

    breakpoints: {
      type: Array,
      default: null,
    },

    licenseFeatureChecker: {
      type: Object,
      default: null,
    },

    required: {
      type: Boolean,
      default: false,
    },

    showPreview: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const spacingData = ref({});

    const hasCustomBreakpoints = computed(() => {
      return props.breakpoints && props.breakpoints.length > 0;
    });

    const showAdvancedSpacingRestriction = computed(() => {
      return (
        hasCustomBreakpoints.value &&
        props.licenseFeatureChecker &&
        !props.licenseFeatureChecker.hasAdvancedSpacing()
      );
    });

    const getAdvancedSpacingRestrictionMessage = () => {
      if (props.licenseFeatureChecker) {
        return props.licenseFeatureChecker.getFeatureRestrictionMessage(
          LicenseFeature.ADVANCED_SPACING
        );
      }
      return 'Продвинутые настройки spacing доступны только в PRO версии. Для снятия ограничений приобретите PRO версию.';
    };

    const allBreakpoints = computed(() => {
      if (props.licenseFeatureChecker) {
        const hasAdvanced = props.licenseFeatureChecker.hasAdvancedSpacing();
        if (!hasAdvanced) {
          return DEFAULT_BREAKPOINTS;
        }
      } else {
        return DEFAULT_BREAKPOINTS;
      }

      if (props.breakpoints && props.breakpoints.length > 0) {
        return Array.isArray(props.breakpoints) ? [...props.breakpoints] : props.breakpoints;
      }
      return DEFAULT_BREAKPOINTS;
    });

    const currentBreakpoint = ref('');

    const availableSpacingTypes = computed(() => {
      return props.spacingTypes && props.spacingTypes.length > 0
        ? props.spacingTypes
        : ALL_SPACING_TYPES;
    });

    const minValue = computed(() => props.min);
    const maxValue = computed(() => props.max);
    const stepValue = computed(() => props.step);

    const initializeSpacingData = () => {
      const initialData = {};

      allBreakpoints.value.forEach(bp => {
        initialData[bp.name] = {};
        availableSpacingTypes.value.forEach(spacingType => {
          const existingValue = props.modelValue?.[bp.name]?.[spacingType];
          initialData[bp.name][spacingType] = existingValue !== undefined ? existingValue : 0;
        });
      });

      spacingData.value = initialData;
    };

    const getFieldId = spacingType => {
      return `${props.fieldName}-${spacingType}-${currentBreakpoint.value}`;
    };

    const getSpacingLabel = spacingType => {
      const labels = {
        'padding-top': 'Внутренний верх',
        'padding-bottom': 'Внутренний низ',
        'margin-top': 'Внешний верх',
        'margin-bottom': 'Внешний низ',
      };
      return labels[spacingType] || spacingType;
    };

    const getSpacingValue = spacingType => {
      return spacingData.value?.[currentBreakpoint.value]?.[spacingType] || 0;
    };

    const handleSpacingChange = (spacingType, event) => {
      const value = Number.parseInt(event.target.value, 10);
      updateSpacingValue(spacingType, value);
    };

    const handleValueInputChange = (spacingType, event) => {
      let value = Number.parseInt(event.target.value, 10);

      if (Number.isNaN(value)) {
        value = 0;
      }
      if (value < minValue.value) {
        value = minValue.value;
      }
      if (value > maxValue.value) {
        value = maxValue.value;
      }

      updateSpacingValue(spacingType, value);
    };

    const updateSpacingValue = (spacingType, value) => {
      if (!spacingData.value[currentBreakpoint.value]) {
        spacingData.value[currentBreakpoint.value] = {};
      }

      spacingData.value[currentBreakpoint.value][spacingType] = value;
      emit('update:modelValue', spacingData.value);
    };

    const getCSSVariablesPreview = () => {
      const lines = [];

      allBreakpoints.value.forEach(bp => {
        const bpData = spacingData.value[bp.name] || {};
        const hasValues = Object.values(bpData).some(v => v > 0);

        if (!hasValues) {
          return;
        }

        if (bp.maxWidth) {
          lines.push(`@media (max-width: ${bp.maxWidth}px) {`);
        }

        availableSpacingTypes.value.forEach(spacingType => {
          const value = bpData[spacingType];
          if (value > 0) {
            const varName = `--${props.fieldName}-${spacingType}`;
            const line = bp.maxWidth ? `  ${varName}: ${value}px;` : `${varName}: ${value}px;`;
            lines.push(line);
          }
        });

        if (bp.maxWidth) {
          lines.push('}');
        }
      });

      return lines.join('\n') || '/* Нет заданных отступов */';
    };

    onMounted(() => {
      if (!currentBreakpoint.value && allBreakpoints.value.length > 0) {
        currentBreakpoint.value = allBreakpoints.value[0].name;
      }
      initializeSpacingData();
    });

    watch(
      () => props.modelValue,
      newValue => {
        if (newValue && Object.keys(newValue).length > 0) {
          spacingData.value = { ...newValue };
        }
      },
      { deep: true }
    );

    watch(allBreakpoints, newBreakpoints => {
      const currentExists = newBreakpoints.some(bp => bp.name === currentBreakpoint.value);

      if (!currentExists && newBreakpoints.length > 0) {
        currentBreakpoint.value = newBreakpoints[0].name;
      }
    });

    return {
      currentBreakpoint,
      spacingData,
      allBreakpoints,
      availableSpacingTypes,
      minValue,
      maxValue,
      stepValue,
      getFieldId,
      getSpacingLabel,
      getSpacingValue,
      handleSpacingChange,
      handleValueInputChange,
      getCSSVariablesPreview,
      showAdvancedSpacingRestriction,
      getAdvancedSpacingRestrictionMessage,
    };
  },
};
</script>

<style scoped>
/* 
 * Стили bb-spacing-control уже включены в @mushket-co/block-builder/index.esm.css
 * Импортируйте стили отдельно: import '@mushket-co/block-builder/index.esm.css'
 */
</style>
