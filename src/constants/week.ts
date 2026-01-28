export const DAYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'] as const
export type Day = (typeof DAYS)[number]

export const HOURS_IN_DAY = 24 as const
export const MINUTES_IN_HOUR = 60 as const
export const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR

