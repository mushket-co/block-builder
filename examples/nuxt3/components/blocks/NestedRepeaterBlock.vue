<template>
  <div class="nested-repeater-block">
    <div class="container">
      <h2 v-if="title" class="block-title">{{ title }}</h2>
      <p v-if="description" class="block-description">{{ description }}</p>

      <div class="categories">
        <div
          v-for="(category, categoryIndex) in categories"
          :key="categoryIndex"
          class="category"
        >
          <div class="category-header">
            <h3 class="category-title">{{ category.name || `Категория ${categoryIndex + 1}` }}</h3>
            <p v-if="category.description" class="category-description">
              {{ category.description }}
            </p>
          </div>

          <div class="products">
            <div
              v-for="(product, productIndex) in category.products || []"
              :key="productIndex"
              class="product"
              :style="productCardStyle(product)"
            >
              <div v-if="product.image || product.thumbnail" class="product-images">
                <div v-if="product.image" class="product-image">
                  <img :src="getImageUrl(product.image)" :alt="product.name" />
                </div>
                <div v-if="product.thumbnail" class="product-thumbnail">
                  <img :src="getImageUrl(product.thumbnail)" :alt="`${product.name} - миниатюра`" />
                </div>
              </div>

              <div class="product-info">
                <div class="product-head">
                  <h4 class="product-name">{{ product.name || `Товар ${productIndex + 1}` }}</h4>
                  <span v-if="product.inStock === false" class="product-badge product-badge--out">
                    Нет в наличии
                  </span>
                  <span v-else-if="product.inStock" class="product-badge product-badge--in">
                    В наличии
                  </span>
                </div>

                <p v-if="product.description" class="product-description">
                  {{ product.description }}
                </p>

                <div v-if="product.tags?.length" class="product-tags">
                  <span
                    v-for="(tag, tagIndex) in product.tags"
                    :key="tagIndex"
                    class="product-tag"
                  >
                    {{ tag.name || tag }}
                  </span>
                </div>

                <div class="product-meta">
                  <span v-if="product.status" class="product-meta-item">
                    Статус: {{ formatStatus(product.status) }}
                  </span>
                  <span v-if="product.deliveryType" class="product-meta-item">
                    Доставка: {{ formatDelivery(product.deliveryType) }}
                  </span>
                </div>

                <div v-if="product.contactEmail || product.productUrl" class="product-links">
                  <a v-if="product.contactEmail" :href="`mailto:${product.contactEmail}`">
                    {{ product.contactEmail }}
                  </a>
                  <a
                    v-if="product.productUrl"
                    :href="product.productUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Страница товара
                  </a>
                </div>

                <div v-if="product.hasDiscount && product.discountPrice" class="product-price-row">
                  <span class="product-price product-price--old">{{ formatPrice(product.price) }}</span>
                  <span class="product-price">{{ formatPrice(product.discountPrice) }}</span>
                </div>
                <div v-else-if="product.price" class="product-price">
                  {{ formatPrice(product.price) }}
                </div>

                <div
                  v-if="product.customContent"
                  class="product-custom"
                  v-html="product.customContent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Каталог товаров',
  },
  description: {
    type: String,
    default: '',
  },
  categories: {
    type: Array,
    default: () => [],
  },
})

const categories = computed(() => props.categories || [])

function getImageUrl(img) {
  if (!img) return ''
  if (typeof img === 'string') return img
  if (typeof img === 'object' && img !== null) {
    return img.src || ''
  }
  return ''
}

function formatPrice(price) {
  if (typeof price === 'number') {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price)
  }
  return price
}

function formatStatus(status) {
  const map = {
    draft: 'Черновик',
    published: 'Опубликован',
    archived: 'В архиве',
  }
  return map[status] || status
}

function formatDelivery(type) {
  const map = {
    pickup: 'Самовывоз',
    courier: 'Курьер',
    post: 'Почта',
  }
  return map[type] || type
}

function productCardStyle(product) {
  if (!product?.accentColor) {
    return undefined
  }
  return { borderLeftColor: product.accentColor }
}
</script>

<style scoped>
.nested-repeater-block {
  padding: 40px 20px;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.block-title {
  text-align: center;
  font-size: 36px;
  margin-bottom: 16px;
  color: #333;
  font-weight: 700;
}

.block-description {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.category-title {
  font-size: 24px;
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 600;
}

.category-description {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #007bff;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.product-image {
  flex: 1;
  height: 180px;
  border-radius: 6px;
  overflow: hidden;
  background: #e9ecef;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-thumbnail {
  width: 100px;
  height: 180px;
  border-radius: 6px;
  overflow: hidden;
  background: #e9ecef;
  border: 2px solid #007bff;
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.product-name {
  font-size: 18px;
  margin: 0;
  color: #333;
  font-weight: 600;
}

.product-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.product-badge--in {
  background: #d4edda;
  color: #155724;
}

.product-badge--out {
  background: #f8d7da;
  color: #721c24;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.product-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e7f1ff;
  color: #004085;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.product-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.product-links a {
  color: #007bff;
  text-decoration: none;
}

.product-links a:hover {
  text-decoration: underline;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #007bff;
}

.product-price--old {
  font-size: 14px;
  font-weight: 500;
  color: #999;
  text-decoration: line-through;
}

.product-custom {
  font-size: 13px;
  color: #555;
}
</style>
