<template>
  <div
    class="table-block"
    :class="[`table-block--gap-${gapSize || 'small'}`, { 'table-block--with-head': showTableHead }]"
  >
    <div class="container">
      <h2 v-if="title" class="table-block__title">{{ title }}</h2>

      <div class="table-block__wrapper">
        <table class="table-block__table">
          <thead v-if="showTableHead && tableHead.length">
            <tr>
              <th
                v-for="column in tableHead"
                :key="column.id"
                :class="[
                  'table-block__th',
                  column.size ? `table-block__th--size-${column.size}` : '',
                  { 'table-block__th--nowrap': column.nowrap },
                ]"
              >
                {{ column.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableBody" :key="row.id">
              <td
                v-for="(cell, cellIndex) in row.fields"
                :key="cell.id"
                :class="[
                  'table-block__td',
                  tableHead[cellIndex]?.size
                    ? `table-block__td--size-${tableHead[cellIndex].size}`
                    : '',
                  { 'table-block__td--nowrap': tableHead[cellIndex]?.nowrap },
                ]"
              >
                <img
                  v-if="tableHead[cellIndex]?.type === 'image' && cell.image"
                  :src="cell.image"
                  alt=""
                  class="table-block__img"
                />
                <div
                  v-else-if="tableHead[cellIndex]?.type === 'wyz'"
                  class="table-block__html"
                  v-html="cell.value"
                />
                <span v-else>{{ cell.value }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  showTableHead: {
    type: Boolean,
    default: true,
  },
  gapSize: {
    type: String,
    default: 'small',
  },
  tableMatrix: {
    type: Object,
    default: () => ({ tableHead: [], tableBody: [] }),
  },
})

const tableHead = computed(() =>
  Array.isArray(props.tableMatrix?.tableHead) ? props.tableMatrix.tableHead : []
)
const tableBody = computed(() =>
  Array.isArray(props.tableMatrix?.tableBody) ? props.tableMatrix.tableBody : []
)
</script>

<style scoped>
.table-block {
  padding: 16px 0;
}

.table-block__title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
}

.table-block__wrapper {
  overflow-x: auto;
}

.table-block__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
}

.table-block--with-head .table-block__table thead {
  background: #f1f3f5;
}

.table-block__th,
.table-block__td {
  padding: 10px 8px;
  border-bottom: 1px solid #dee2e6;
  text-align: left;
  vertical-align: top;
}

.table-block--gap-big .table-block__th,
.table-block--gap-big .table-block__td {
  padding-left: 20px;
  padding-right: 20px;
}

.table-block__th--nowrap,
.table-block__td--nowrap {
  white-space: nowrap;
}

.table-block__th--size-small,
.table-block__td--size-small {
  width: 140px;
}

.table-block__th--size-normal,
.table-block__td--size-normal {
  width: 240px;
}

.table-block__th--size-large,
.table-block__td--size-large {
  width: 360px;
}

.table-block__html :deep(p) {
  margin: 0 0 8px;
}

.table-block__html :deep(p:last-child) {
  margin-bottom: 0;
}

.table-block__img {
  display: block;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
}
</style>
