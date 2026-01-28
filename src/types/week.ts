import type { Day } from '@/constants/week'

export type DaysRecord<T> = Record<Day, T>

export interface TimeInterval {
	/**
	 * Begin time in minutes from day start (0..1439), inclusive.
	 */
	bt: number
	/**
	 * End time in minutes from day start (0..1439), inclusive.
	 */
	et: number
}

