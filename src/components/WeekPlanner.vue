<script setup lang="ts">
import { computed, toRef } from 'vue'
import { DAYS, HOURS_IN_DAY } from '@/constants/week'
import { useWeekPlannerSelection } from '@/composables/useWeekPlannerSelection'
import type { Day } from '@/constants/week'
import type { DaysRecord, TimeInterval } from '@/types/week'

const props = defineProps<{
  data: DaysRecord<TimeInterval[]>
  setNewData: (newData: DaysRecord<TimeInterval[]>) => void
}>()

const {
  isBlockSelected,
  toggleAllDay,
  handleMouseDown,
  handleMouseOver,
  cancelAllChanges,
  save,
  statusMessage
} = useWeekPlannerSelection({
  sourceData: toRef(props, 'data'),
  onSave: props.setNewData
})

const days = computed<readonly Day[]>(() => DAYS)
</script>

<template>
  <div class="flex flex-col">
    <div class="ml-20 flex">
      <div v-for="hour in HOURS_IN_DAY" :key="hour" class="relative h-3 w-6 text-center">
        <div v-if="(hour - 1) % 3 === 0" class="h-full w-full border-l border-gray-700">
          <span class="absolute left-0 top-0 -translate-y-[100%]">
            {{ (hour - 1 < 10 ? '0' : '') + (hour - 1) }}:00</span
          >
        </div>
      </div>
    </div>
    <div v-for="day of days" :key="day" class="flex items-center">
      <div class="w-20">
        <button
          @click="toggleAllDay(day)"
          class="basic-transition text-xl font-medium leading-[1] text-blue-500 hover:text-blue-700"
        >
          {{ day }}
        </button>
      </div>
      <div class="flex">
        <button
          v-for="hour in HOURS_IN_DAY"
          :key="hour"
          :class="isBlockSelected(day, hour - 1) ? 'bg-green-500' : 'bg-gray-200'"
          class="basic-transition h-6 w-6 cursor-pointer border border-gray-300"
          @mousedown="handleMouseDown(day, hour - 1)"
          @mouseover="handleMouseOver(day, hour - 1)"
        ></button>
      </div>
    </div>
    <div class="mt-5 flex items-center gap-3 self-end">
      <div v-if="statusMessage" class="text-sm text-gray-600">{{ statusMessage }}</div>
      <button
        class="basic-transition rounded-xl bg-gray-300 px-5 py-2 hover:bg-gray-400"
        @click="cancelAllChanges"
      >
        Cancel
      </button>
      <button
        class="basic-transition rounded-xl bg-gray-300 px-5 py-2 hover:bg-gray-400"
        @click="save"
      >
        Save
      </button>
    </div>
  </div>
</template>
