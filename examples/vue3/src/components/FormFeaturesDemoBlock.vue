<template>
  <section class="form-features-demo-block">
    <div class="container">
      <h2 class="form-features-demo-block__title">{{ blockTitle }}</h2>
      <p class="form-features-demo-block__hint">
        После save в localStorage нет полей <code>_xlsxImport</code>, <code>_demoHelper</code> —
        только данные ниже.
      </p>

      <div v-if="showFilterOptions && filterOptions?.length" class="form-features-demo-block__filters">
        <h3>Фильтры</h3>
        <ul>
          <li v-for="(filter, index) in filterOptions" :key="`f-${index}`">
            <strong>{{ filter.name }}</strong>:
            {{ (filter.options || []).map(o => o.name).join(', ') || '—' }}
          </li>
        </ul>
      </div>

      <div v-if="items?.length" class="form-features-demo-block__cards">
        <h3>Карточки</h3>
        <article
          v-for="(item, index) in items"
          :key="`item-${index}`"
          class="form-features-demo-block__card"
        >
          <h4>{{ item.title || `Карточка ${index + 1}` }}</h4>
          <p v-if="item.filters?.length">
            Фильтры:
            <span v-for="(value, fi) in item.filters" :key="fi" class="form-features-demo-block__tag">{{
              value
            }}</span>
          </p>
          <p v-else class="form-features-demo-block__muted">Без привязки к фильтрам</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  blockTitle: {
    type: String,
    default: 'Form Features Demo',
  },
  showFilterOptions: {
    type: Boolean,
    default: false,
  },
  filterOptions: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.form-features-demo-block {
  padding: 2rem 0;
  background: linear-gradient(180deg, #f0f4ff 0%, #fff 100%);
}

.form-features-demo-block__title {
  margin: 0 0 0.5rem;
}

.form-features-demo-block__hint {
  margin: 0 0 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.form-features-demo-block__filters,
.form-features-demo-block__cards {
  margin-top: 1.25rem;
}

.form-features-demo-block__card {
  padding: 1rem;
  margin-top: 0.75rem;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #fff;
}

.form-features-demo-block__tag {
  display: inline-block;
  margin: 0.15rem 0.35rem 0.15rem 0;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: #dbeafe;
  font-size: 0.85rem;
}

.form-features-demo-block__muted {
  color: #888;
  margin: 0;
}
</style>
