import { DAYS } from '@/constants/week'
import type { DaysRecord, TimeInterval } from '@/types/week'

export const WEEK_PLANNER_STORAGE_KEY = 'week-planner:data:v1' as const

function isTimeInterval(value: object): value is TimeInterval {
	if (!('bt' in value) || !('et' in value)) return false
	const bt = (value as { bt: number }).bt
	const et = (value as { et: number }).et
	return (
		typeof bt === 'number' &&
		typeof et === 'number' &&
		Number.isFinite(bt) &&
		Number.isFinite(et) &&
		bt >= 0 &&
		et >= 0 &&
		bt <= 1439 &&
		et <= 1439 &&
		bt <= et
	)
}

function isDaysRecordOfIntervals(value: unknown): value is DaysRecord<TimeInterval[]> {
	if (!value || typeof value !== 'object') return false
	const obj = value as Record<string, unknown>
	return DAYS.every((day) => {
		const dayValue = obj[day]
		return (
			Array.isArray(dayValue) &&
			dayValue.every((item) => !!item && typeof item === 'object' && isTimeInterval(item as object))
		)
	})
}

export function loadWeekPlannerData(): DaysRecord<TimeInterval[]> | null {
	try {
		const raw = localStorage.getItem(WEEK_PLANNER_STORAGE_KEY)
		if (!raw) return null
		const parsed: unknown = JSON.parse(raw)
		return isDaysRecordOfIntervals(parsed) ? parsed : null
	} catch {
		return null
	}
}

export function saveWeekPlannerData(data: DaysRecord<TimeInterval[]>): void {
	localStorage.setItem(WEEK_PLANNER_STORAGE_KEY, JSON.stringify(data))
}

