<template>
  <div class="toggle-repeater-block">
    <div class="container">
      <p class="toggle-repeater-block__hint">
        Regression: включите «Основные логотипы» или «Ссылки» — в форме должен появиться repeater внутри toggle-group.
      </p>

      <section v-if="showLogos && logos?.length" class="toggle-repeater-block__section">
        <h3 class="toggle-repeater-block__title">Логотипы</h3>
        <ul class="toggle-repeater-block__list">
          <li v-for="(item, index) in logos" :key="`logo-${index}`">
            <strong>{{ item.name || `Логотип ${index + 1}` }}</strong>
            <span v-if="item.url"> — {{ item.url }}</span>
          </li>
        </ul>
      </section>

      <section v-if="showLinks && links?.length" class="toggle-repeater-block__section">
        <h3 class="toggle-repeater-block__title">Ссылки</h3>
        <ul class="toggle-repeater-block__list">
          <li v-for="(item, index) in links" :key="`link-${index}`">
            <a v-if="item.url" :href="item.url" class="toggle-repeater-block__link">{{ item.name || item.url }}</a>
            <span v-else>{{ item.name || `Ссылка ${index + 1}` }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showLogos: {
    type: Boolean,
    default: false,
  },
  logos: {
    type: Array,
    default: () => [],
  },
  showLinks: {
    type: Boolean,
    default: false,
  },
  links: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.toggle-repeater-block {
  padding: 16px 0;
}

.toggle-repeater-block__hint {
  margin: 0 0 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #fff8e6;
  border: 1px solid #f0d78c;
  color: #6b5a1e;
  font-size: 14px;
  line-height: 1.5;
}

.toggle-repeater-block__section + .toggle-repeater-block__section {
  margin-top: 20px;
}

.toggle-repeater-block__title {
  margin: 0 0 8px;
  font-size: 16px;
}

.toggle-repeater-block__list {
  margin: 0;
  padding-left: 20px;
}

.toggle-repeater-block__link {
  color: var(--bb-color-primary, #0066cc);
  text-decoration: none;
}

.toggle-repeater-block__link:hover {
  text-decoration: underline;
}
</style>
