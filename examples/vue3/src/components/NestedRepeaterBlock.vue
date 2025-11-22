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
                <h4 class="product-name">{{ product.name || `Товар ${productIndex + 1}` }}</h4>
                <p v-if="product.description" class="product-description">
                  {{ product.description }}
                </p>
                <div v-if="product.price" class="product-price">
                  {{ formatPrice(product.price) }}
                </div>
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
    default: 'Каталог товаров'
  },
  description: {
    type: String,
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const getImageUrl = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img !== null) {
    return img.src || '';
  }
  return '';
}

const formatPrice = (price) => {
  if (typeof price === 'number') {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price)
  }
  return price
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
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

.product-name {
  font-size: 18px;
  margin: 0;
  color: #333;
  font-weight: 600;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #007bff;
  margin-top: 8px;
}
</style>

