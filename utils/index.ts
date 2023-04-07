import { constants } from 'sweph'

export const {
  SE_SUN,
  SE_MOON,
  SE_MERCURY,
  SE_VENUS,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  SE_URANUS,
  SE_NEPTUNE,
  SE_PLUTO,
  SEFLG_SPEED,
  SEFLG_SWIEPH
} = constants

export const PLANETS: any = {
  sun: SE_SUN,
  moon: SE_MOON,
  mercury: SE_MERCURY,
  venus: SE_VENUS,
  mars: SE_MARS,
  jupiter: SE_JUPITER,
  saturn: SE_SATURN,
  uranus: SE_URANUS,
  neptune: SE_NEPTUNE,
  pluto: SE_PLUTO
}

export const planetsByType = {
  sun: 'luminary',
  moon: 'luminary',
  mercury: 'personal',
  venus: 'personal',
  mars: 'personal',
  jupiter: 'social',
  saturn: 'social',
  uranus: 'transpersonal',
  neptune: 'transpersonal',
  pluto: 'transpersonal'
}

export const FLAG = SEFLG_SPEED | SEFLG_SWIEPH

export interface Planets {
  sun: Planet
  moon: Planet
  mercury: Planet
  venus: Planet
  mars: Planet
  jupiter: Planet
  saturn: Planet
  uranus: Planet
  neptune: Planet
  pluto: Planet
}

export interface Planet {
  name: string
  position: Position
  speed: number
  retrograde: boolean
  sign: number
  type: string
}

export interface Position {
  degrees: number
  minutes: number
  seconds: number
  longitude: number
}
