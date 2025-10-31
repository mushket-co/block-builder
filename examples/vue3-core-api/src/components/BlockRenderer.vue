<template>
  <div class="block-renderer">
    <component
      :is="getComponent"
      v-bind="blockProps"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { blockConfigs } from '../configs/block-config'

const props = defineProps({
  type: String,
  props: Object
})

const getComponent = computed(() => {
  const config = blockConfigs[props.type]
  if (!config || !config.render || config.render.kind !== 'component') {
    return 'div'
  }
  return config.render.component
})

const blockProps = computed(() => props.props || {})
</script>

<style scoped>
.block-renderer {
  width: 100%;
}
</style>

