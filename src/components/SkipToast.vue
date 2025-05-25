<template>
  <div class="skip-toast">
    <span>{{ prefix }}</span>
    <strong v-if="departmentName">{{ departmentName }}</strong>
    <span v-if="departmentName && chefLieu"> (</span>
    <strong v-if="chefLieu">{{ chefLieu }}</strong>
    <span v-if="departmentName && chefLieu">)</span>
    <span v-if="!departmentName && !chefLieu">{{ suffix }}</span>
    <span v-else>.</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  prefix?: string;
  departmentName?: string;
  chefLieu?: string;
  suffix?: string;
}

defineProps<Props>();
</script>

<style scoped>
.skip-toast {
  color: inherit;
}

.skip-toast strong {
  font-weight: 700;
}
</style>
