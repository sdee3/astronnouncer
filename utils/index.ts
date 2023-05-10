import { constants } from 'sweph'

export type Environment = 'development' | 'production'

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

export const PLANETS = {
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
  sun: PlanetData
  moon: PlanetData
  mercury: PlanetData
  venus: PlanetData
  mars: PlanetData
  jupiter: PlanetData
  saturn: PlanetData
  uranus: PlanetData
  neptune: PlanetData
  pluto: PlanetData
}

export interface PlanetData {
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

export type Aspect =
  | 'conjunction'
  | 'opposition'
  | 'square'
  | 'trine'
  | 'sextile'
  | 'quincunx'
  | 'semisextile'

export interface AspectOccurrence {
  planetName1: PlanetName
  planetName2: PlanetName
  aspect: Aspect
  degree1: number
  degree2: number
  sign1: Sign
  sign2: Sign
  /** A DD-MM-YYYY timestamp */
  date: string
}

export interface RetrogradeOccurrence {
  planetName: PlanetName
  startedRetrograde: boolean
}

export interface PlanetDataByDate {
  names: PlanetName[]
  positions: Position[]
  signs: Sign[]
  retrogrades: boolean[]
}
