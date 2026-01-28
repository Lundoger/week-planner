import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from 'vue'
import type { Day } from '@/constants/week'
import type { DaysRecord, TimeInterval } from '@/types/week'
import {
	applyIntervalsToSelection,
	createEmptySelection,
	selectionToIntervals,
	type DaySelection
} from '@/utils/weekPlannerIntervals'

export interface UseWeekPlannerSelectionOptions {
	sourceData: Ref<DaysRecord<TimeInterval[]>>
	onSave: (data: DaysRecord<TimeInterval[]>) => void
}

export interface UseWeekPlannerSelectionReturn {
	selection: DaySelection
	isMouseDown: Readonly<{ value: boolean }>
	statusMessage: Readonly<{ value: string | null }>
	isBlockSelected: (day: Day, hour: number) => boolean
	toggleBlock: (day: Day, hour: number) => void
	toggleAllDay: (day: Day) => void
	handleMouseDown: (day: Day, hour: number) => void
	handleMouseOver: (day: Day, hour: number) => void
	cancelAllChanges: () => void
	save: () => void
}

export function useWeekPlannerSelection(
	options: UseWeekPlannerSelectionOptions
): UseWeekPlannerSelectionReturn {
	const selection = reactive<DaySelection>(createEmptySelection())
	const isMouseDown = ref(false)
	const baselineData = ref<DaysRecord<TimeInterval[]>>(options.sourceData.value)
	const statusMessage = ref<string | null>(null)
	let statusTimeoutId: number | null = null

	const clearStatus = (): void => {
		if (statusTimeoutId !== null) window.clearTimeout(statusTimeoutId)
		statusTimeoutId = null
		statusMessage.value = null
	}

	const setStatus = (message: string): void => {
		clearStatus()
		statusMessage.value = message
		statusTimeoutId = window.setTimeout(() => {
			statusMessage.value = null
			statusTimeoutId = null
		}, 1200)
	}

	const initFromData = (data: DaysRecord<TimeInterval[]>): void => {
		applyIntervalsToSelection(selection, data)
	}

	const isDirty = computed<boolean>(() => {
		const current = selectionToIntervals(selection)
		const base = baselineData.value
		return JSON.stringify(current) !== JSON.stringify(base)
	})

	const isBlockSelected = (day: Day, hour: number): boolean => selection[day][hour]

	const toggleBlock = (day: Day, hour: number): void => {
		selection[day][hour] = !selection[day][hour]
	}

	const toggleAllDay = (day: Day): void => {
		const allSelected = selection[day].every(Boolean)
		selection[day] = selection[day].map(() => !allSelected)
	}

	const handleMouseDown = (day: Day, hour: number): void => {
		isMouseDown.value = true
		toggleBlock(day, hour)
	}

	const handleMouseOver = (day: Day, hour: number): void => {
		if (isMouseDown.value) selection[day][hour] = true
	}

	const handleMouseUp = (): void => {
		isMouseDown.value = false
	}

	const save = (): void => {
		const intervals = selectionToIntervals(selection)
		baselineData.value = intervals
		options.onSave(intervals)
		setStatus('Saved')
	}

	const cancelAllChanges = (): void => {
		initFromData(baselineData.value)
		setStatus('Reverted')
	}

	onMounted(() => {
		baselineData.value = options.sourceData.value
		initFromData(options.sourceData.value)
		window.addEventListener('mouseup', handleMouseUp)
	})

	watch(
		options.sourceData,
		(next) => {
			baselineData.value = next
			// If there are no local edits, keep UI in sync with external changes.
			if (!isDirty.value) initFromData(next)
		},
		{ deep: true }
	)

	onBeforeUnmount(() => {
		window.removeEventListener('mouseup', handleMouseUp)
		clearStatus()
	})

	return {
		selection,
		isMouseDown,
		statusMessage,
		isBlockSelected,
		toggleBlock,
		toggleAllDay,
		handleMouseDown,
		handleMouseOver,
		cancelAllChanges,
		save
	}
}

