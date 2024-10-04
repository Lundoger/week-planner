export interface IDaysWithTime<Val> {
  mo: Val
  tu: Val
  we: Val
  th: Val
  fr: Val
  sa: Val
  su: Val
}

export interface ITime {
  bt: number
  et: number
}

export type TDaysString = 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa' | 'su'
