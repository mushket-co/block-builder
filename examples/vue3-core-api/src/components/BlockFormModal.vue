<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEdit ? 'Редактирование блока' : 'Создание блока' }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div
          v-for="field in fields"
          :key="field.field"
          class="form-group"
        >
          <label class="form-label">{{ field.label }}</label>

          <textarea
            v-if="field.type === 'textarea'"
            v-model="formData[field.field]"
            class="form-textarea"
          />

          <input
            v-else-if="field.type === 'color'"
            type="color"
            v-model="formData[field.field]"
            class="form-input"
            style="height: 40px;"
          />

          <input
            v-else
            :type="field.type"
            v-model="formData[field.field]"
            class="form-input"
          />
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Отмена</button>
          <button type="submit" class="btn">{{ isEdit ? 'Сохранить' : 'Создать' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  fields: Array,
  initialData: Object,
  isEdit: Boolean
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({})

// Инициализация формы
watch(() => props.show, (newVal) => {
  if (newVal && props.fields) {
    formData.value = {}
    props.fields.forEach(field => {
      formData.value[field.field] = props.initialData?.[field.field] || field.defaultValue || ''
    })
  }
})

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>

