import { Aspect, PlanetName, Sign } from '../utils'

export type EventType = 'sign_ingress' | 'aspect' | 'retrograde'

export const signIngressKey = (planet: PlanetName, sign: Sign): string =>
  `sign:${planet}:${sign}`

export const retrogradeKey = (
  planet: PlanetName,
  isRetrograde: boolean,
  sign: Sign
): string =>
  `retrograde:${planet}:${isRetrograde ? 'retrograde' : 'direct'}:${sign}`

export const aspectKey = (
  planetName1: PlanetName,
  planetName2: PlanetName,
  sign1: Sign,
  sign2: Sign,
  aspect: Aspect
): string => {
  const [p1, p2, s1, s2] =
    planetName1 < planetName2
      ? [planetName1, planetName2, sign1, sign2]
      : [planetName2, planetName1, sign2, sign1]

  return `aspect:${aspect}:${p1}:${p2}:${s1}:${s2}`
}
