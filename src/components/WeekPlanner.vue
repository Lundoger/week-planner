<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { IDaysWithTime, ITime, TDaysString } from '@/types/types'

const props = defineProps<{
  data: IDaysWithTime<ITime[]>
  setNewData: (newData: IDaysWithTime<ITime[]>) => void
}>()

const selection = reactive<IDaysWithTime<boolean[]>>({
  mo: Array(24).fill(false),
  tu: Array(24).fill(false),
  we: Array(24).fill(false),
  th: Array(24).fill(false),
  fr: Array(24).fill(false),
  sa: Array(24).fill(false),
  su: Array(24).fill(false)
})

const isMouseDown = ref(false)

const initFromProps = (data: IDaysWithTime<ITime[]>) => {
  Object.keys(data).forEach((dayKey) => {
    const key = dayKey as TDaysString
    data[key].forEach((interval: ITime) => {
      const startHour = Math.floor(interval.bt / 60)
      const endHour = Math.floor(interval.et / 60)
      for (let i = startHour; i <= endHour; i++) {
        selection[key][i] = true
      }
    })
  })
}

// Сброс всех часов на невыбранное состояние
const resetSelection = () => {
  Object.keys(selection).forEach((dayKey) => {
    const key = dayKey as TDaysString
    selection[key] = Array(24).fill(false)
  })
}

//проверка что бы дать фон как выбранного
const isBlockSelected = (dayKey: TDaysString, hour: any) => {
  return selection[dayKey][hour]
}

//тогл
const toggleBlock = (dayKey: TDaysString, hour: any) => {
  selection[dayKey][hour] = !selection[dayKey][hour]
}

//тогл всего ряда напротив одного дня
const toggleAllDay = (dayKey: TDaysString) => {
  const allSelected = selection[dayKey].every((hour) => hour)
  selection[dayKey] = Array(24).fill(!allSelected)
}

//калбеки для ивентов мыши
const handleMouseDown = (dayKey: TDaysString, hour: any) => {
  isMouseDown.value = true
  toggleBlock(dayKey, hour)
}

const handleMouseOver = (dayKey: TDaysString, hour: any) => {
  if (isMouseDown.value) {
    selection[dayKey][hour] = true
  }
}

const handleMouseUp = () => {
  isMouseDown.value = false
}

//на основе селекшина генерируем требуемый json
const getSelectedIntervals = (): IDaysWithTime<ITime[]> => {
  let result: IDaysWithTime<ITime[]> = {
    mo: [],
    tu: [],
    we: [],
    th: [],
    fr: [],
    sa: [],
    su: []
  }

  Object.keys(selection).forEach((dayKey) => {
    const key = dayKey as TDaysString
    const daySelection = selection[key]

    let intervalStart: number | null = null

    daySelection.forEach((isSelected, hour) => {
      //если выбранный блок и интервал еще не обозначен записываем начало
      if (isSelected && intervalStart === null) {
        intervalStart = hour
      }
      //если интервал уже начался и выбранные елементы закончились то записываем начало и конец
      if (!isSelected && intervalStart !== null) {
        result[key].push({
          bt: intervalStart * 60, // Начало интервала в минутах
          et: (hour - 1) * 60 + 59 // Конец интервала в минутах
        })
        intervalStart = null
      }
    })

    // Если интервал не завершился в конце дня
    if (intervalStart !== null) {
      result[key].push({
        bt: intervalStart * 60,
        et: 23 * 60 + 59 // Конец дня в минутах
      })
    }
  })

  return result
}

//функции save и cancel
const logSelectedIntervals = () => {
  const intervals = getSelectedIntervals()
  props.setNewData(intervals)
}

const cancelAllChanges = () => {
  resetSelection()
  initFromProps(props.data)
}

//изначально закрашиваем те что в переданом в пропсах объекте
onMounted(() => {
  initFromProps(props.data)
  window.addEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="flex flex-col">
    <div class="ml-20 flex">
      <div v-for="hour in 24" :key="hour" class="relative h-3 w-6 text-center">
        <div v-if="(hour - 1) % 3 === 0" class="h-full w-full border-l border-gray-700">
          <span class="absolute left-0 top-0 -translate-y-[100%]">
            {{ (hour - 1 < 10 ? '0' : '') + (hour - 1) }}:00</span
          >
        </div>
      </div>
    </div>
    <div v-for="(day, index) of Object.keys(data)" :key="index" class="flex items-center">
      <div class="w-20">
        <button
          @click="toggleAllDay(day as TDaysString)"
          class="basic-transition text-xl font-medium leading-[1] text-blue-500 hover:text-blue-700"
        >
          {{ day }}
        </button>
      </div>
      <div class="flex">
        <button
          v-for="hour in 24"
          :key="hour"
          :class="isBlockSelected(day as TDaysString, hour - 1) ? 'bg-green-500' : 'bg-gray-200'"
          class="basic-transition h-6 w-6 cursor-pointer border border-gray-300"
          @mousedown="handleMouseDown(day as TDaysString, hour - 1)"
          @mouseover="handleMouseOver(day as TDaysString, hour - 1)"
        ></button>
      </div>
    </div>
    <div class="mt-5 flex items-center gap-6 self-end">
      <button
        class="basic-transition rounded-xl bg-gray-300 px-5 py-2 hover:bg-gray-400"
        @click="cancelAllChanges"
      >
        Cancel
      </button>
      <button
        class="basic-transition rounded-xl bg-gray-300 px-5 py-2 hover:bg-gray-400"
        @click="logSelectedIntervals"
      >
        Save
      </button>
    </div>
  </div>
</template>
