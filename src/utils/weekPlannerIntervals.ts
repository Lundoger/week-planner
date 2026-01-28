import { DAYS, HOURS_IN_DAY, MINUTES_IN_HOUR } from '@/constants/week'
import type { DaysRecord, TimeInterval } from '@/types/week'

export type DaySelection = DaysRecord<boolean[]>

export function createEmptySelection(): DaySelection {
	return Object.fromEntries(DAYS.map((d) => [d, Array(HOURS_IN_DAY).fill(false)])) as DaySelection
}

export function resetSelection(selection: DaySelection): void {
	for (const day of DAYS) {
		selection[day] = Array(HOURS_IN_DAY).fill(false)
	}
}

export function applyIntervalsToSelection(
	selection: DaySelection,
	data: DaysRecord<TimeInterval[]>
): void {
	resetSelection(selection)

	for (const day of DAYS) {
		for (const interval of data[day]) {
			const startHour = Math.floor(interval.bt / MINUTES_IN_HOUR)
			const endHour = Math.floor(interval.et / MINUTES_IN_HOUR)
			for (let hour = startHour; hour <= endHour; hour++) {
				if (hour >= 0 && hour < HOURS_IN_DAY) selection[day][hour] = true
			}
		}
	}
}

export function selectionToIntervals(selection: DaySelection): DaysRecord<TimeInterval[]> {
	const result = Object.fromEntries(DAYS.map((d) => [d, [] as TimeInterval[]])) as DaysRecord<
		TimeInterval[]
	>

	for (const day of DAYS) {
		const daySelection = selection[day]
		let intervalStartHour: number | null = null

		for (let hour = 0; hour < daySelection.length; hour++) {
			const isSelected = daySelection[hour]

			if (isSelected && intervalStartHour === null) {
				intervalStartHour = hour
			}

			if (!isSelected && intervalStartHour !== null) {
				result[day].push({
					bt: intervalStartHour * MINUTES_IN_HOUR,
					et: (hour - 1) * MINUTES_IN_HOUR + (MINUTES_IN_HOUR - 1)
				})
				intervalStartHour = null
			}
		}

		if (intervalStartHour !== null) {
			result[day].push({
				bt: intervalStartHour * MINUTES_IN_HOUR,
				et: (HOURS_IN_DAY - 1) * MINUTES_IN_HOUR + (MINUTES_IN_HOUR - 1)
			})
		}
	}

	return result
}

