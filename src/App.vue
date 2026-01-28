<script setup lang="ts">
import { ref } from 'vue'
import WeekPlanner from './components/WeekPlanner.vue'
import type { DaysRecord, TimeInterval } from '@/types/week'
import { loadWeekPlannerData, saveWeekPlannerData } from '@/utils/weekPlannerStorage'

const defaultData: DaysRecord<TimeInterval[]> = {
  mo: [
    {
      bt: 240,
      et: 779
    }
  ],
  tu: [],
  we: [],
  th: [
    {
      bt: 240,
      et: 779
    },
    {
      bt: 1140,
      et: 1319
    }
  ],
  fr: [
    {
      bt: 660,
      et: 1019
    }
  ],
  sa: [
    {
      bt: 0,
      et: 1439
    }
  ],
  su: []
}

const data = ref<DaysRecord<TimeInterval[]>>(loadWeekPlannerData() ?? defaultData)

const setNewData = (newData: DaysRecord<TimeInterval[]>) => {
  data.value = newData
  saveWeekPlannerData(newData)
}
</script>

<template>
  <div class="wrapper">
    <main class="flex h-screen w-screen items-center justify-center">
      <WeekPlanner :data="data" :set-new-data="setNewData" />
    </main>
  </div>
</template>
