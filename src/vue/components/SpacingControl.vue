<template>
  <div :class="CSS_CLASSES.SPACING_CONTROL">
    <div :class="CSS_CLASSES.SPACING_CONTROL_HEADER">
      <label :class="CSS_CLASSES.SPACING_CONTROL_LABEL">
        {{ resolvedLabel }}
        <span v-if="required" :class="CSS_CLASSES.REQUIRED">*</span>
      </label>
    </div>

    <div :class="CSS_CLASSES.SPACING_CONTROL_BREAKPOINTS">
      <button
        v-for="bp in allBreakpoints"
        :key="bp.name"
        type="button"
        :class="[
          CSS_CLASSES.SPACING_CONTROL_BREAKPOINT_BTN,
          { [CSS_CLASSES.SPACING_CONTROL_BREAKPOINT_BTN_ACTIVE]: currentBreakpoint === bp.name },
        ]"
        @click="currentBreakpoint = bp.name"
      >
        {{ bp.label }}
      </button>
    </div>

    <div :class="CSS_CLASSES.SPACING_CONTROL_GROUPS">
      <div
        v-for="spacingType in availableSpacingTypes"
        :key="spacingType"
        :class="CSS_CLASSES.SPACING_CONTROL_GROUP"
      >
        <label :for="getFieldId(spacingType)" :class="CSS_CLASSES.SPACING_CONTROL_GROUP_LABEL">
          {{ getSpacingLabel(spacingType) }}
        </label>

        <div :class="CSS_CLASSES.SPACING_CONTROL_SLIDER_WRAPPER">
          <input
            :id="getFieldId(spacingType)"
            type="range"
            :class="CSS_CLASSES.SPACING_CONTROL_SLIDER"
            :min="minValue"
            :max="maxValue"
            :step="stepValue"
            :value="getSpacingValue(spacingType)"
            @input="handleSpacingChange(spacingType, $event)"
          />
          <input
            type="number"
            :class="CSS_CLASSES.SPACING_CONTROL_VALUE_INPUT"
            :min="minValue"
            :max="maxValue"
            :step="stepValue"
            :value="getSpacingValue(spacingType)"
            @input="handleValueInputChange(spacingType, $event)"
          />
          <span :class="CSS_CLASSES.SPACING_CONTROL_UNIT">px</span>
        </div>
      </div>
    </div>

    <div v-if="showPreview" :class="CSS_CLASSES.SPACING_CONTROL_PREVIEW">
      <div :class="CSS_CLASSES.SPACING_CONTROL_PREVIEW_TITLE">{{ spacingCssVariablesPreviewLabel }}</div>
      <pre :class="CSS_CLASSES.SPACING_CONTROL_PREVIEW_CODE">{{ getCSSVariablesPreview() }}</pre>
    </div>
  </div>
</template>

<script>
import { CSS_CLASSES } from '../../utils/constants';
import {
  ALL_SPACING_TYPES,
  getDefaultBreakpointsFromUi,
  getSpacingLabelsFromUi,
} from '../../utils/spacingHelpers';
import { useUiStrings } from '../composables/useUiStrings';
import { computed, onMounted, ref, watch } from 'vue';

export default {
  name: 'SpacingControl',
  props: {
    label: {
      type: String,
      default: undefined,
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
    const uiStrings = useUiStrings();
    const spacingData = ref({});

    const resolvedLabel = computed(() => props.label ?? uiStrings.value.spacingDefaultLabel);
    const spacingLabels = computed(() => getSpacingLabelsFromUi(uiStrings.value));
    const spacingCssVariablesPreviewLabel = computed(() => uiStrings.value.spacingCssVariablesPreview);

    const allBreakpoints = computed(() => {
      if (props.breakpoints && props.breakpoints.length > 0) {
        return Array.isArray(props.breakpoints) ? [...props.breakpoints] : props.breakpoints;
      }
      return getDefaultBreakpointsFromUi(uiStrings.value);
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
      return spacingLabels.value[spacingType] || spacingType;
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
      CSS_CLASSES,
      resolvedLabel,
      spacingCssVariablesPreviewLabel,
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
    };
  },
};
</script>
