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

export type PlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'

export enum Sign {
  'Aries' = 1,
  'Taurus' = 2,
  'Gemini' = 3,
  'Cancer' = 4,
  'Leo' = 5,
  'Virgo' = 6,
  'Libra' = 7,
  'Scorpio' = 8,
  'Sagittarius' = 9,
  'Capricorn' = 10,
  'Aquarius' = 11,
  'Pisces' = 12
}

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

export interface PositionWithSign {
  position: Position
  sign: Sign
}
