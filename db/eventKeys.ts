import { Aspect, PlanetName, Sign } from '../utils'

export type EventType = 'sign_ingress' | 'aspect' | 'retrograde'

export const utcDay = (date = new Date()): string =>
  date.toISOString().slice(0, 10)

export const signIngressKey = (
  planet: PlanetName,
  sign: Sign,
  date = new Date()
): string => `ingress:${planet}:${sign}:${utcDay(date)}`

export const retrogradeKey = (
  planet: PlanetName,
  isRetrograde: boolean,
  sign: Sign,
  date = new Date()
): string =>
  `retrograde:${planet}:${isRetrograde ? 'retrograde' : 'direct'}:${sign}:${utcDay(date)}`

export const aspectKey = (
  planetName1: PlanetName,
  planetName2: PlanetName,
  sign1: Sign,
  sign2: Sign,
  aspect: Aspect,
  degree1: number,
  minute1: number,
  degree2: number,
  minute2: number
): string => {
  const [p1, p2, s1, s2, d1, m1, d2, m2] =
    planetName1 < planetName2
      ? [planetName1, planetName2, sign1, sign2, degree1, minute1, degree2, minute2]
      : [planetName2, planetName1, sign2, sign1, degree2, minute2, degree1, minute1]

  return `aspect:${aspect}:${p1}:${p2}:${s1}:${s2}:${d1}:${m1}:${d2}:${m2}`
}
