import sweph from 'sweph'
import {
  FLAG,
  PLANETS,
  PlanetName,
  Planets,
  Position,
  Sign,
  planetsByType
} from '../utils'

export class AstroWatcher {
  public utcToJulianUt = (utcDate: Date) => {
    const milliSecondsInSeconds = utcDate.getUTCMilliseconds() / 1000
    const secondsInMinutes =
      (utcDate.getUTCSeconds() + milliSecondsInSeconds) / 60
    const minutesInHours = (utcDate.getUTCMinutes() + secondsInMinutes) / 60

    const hours = utcDate.getUTCHours() + minutesInHours

    return sweph.julday(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth() + 1,
      utcDate.getUTCDate(),
      hours,
      sweph.constants.SE_GREG_CAL
    )
  }

  public utcToJulianEt = (utcDate: Date) => {
    const julianUt = this.utcToJulianUt(utcDate)
    const delta = sweph.deltat(julianUt)
    return julianUt + delta
  }

  public degreesToDms = (value: number) => {
    const position = sweph.split_deg(
      value,
      sweph.constants.SE_SPLIT_DEG_ZODIACAL
    )
    const { degree: degrees, minute: minutes, second: seconds } = position
    return {
      degrees,
      minutes,
      seconds,
      longitude: value
    }
  }

  public zodiacSign = (degrees: number) => (Math.floor(degrees / 30) % 12) + 1

  public normalizeDegrees = (degrees: number) => {
    if (degrees < -180) {
      return degrees + 360
    }
    if (degrees > 180) {
      return degrees - 360
    }

    return degrees
  }

  public getPositionOfAstro = (astro: string, julianDay: number) =>
    sweph.calc(julianDay, PLANETS[astro], FLAG)

  public isRetrograde = (speed: number) => speed < 0

  public position = (astrologyObject: string, moment: Date) => {
    const julianDay = this.utcToJulianEt(moment)
    const { data } = this.getPositionOfAstro(astrologyObject, julianDay)
    const longitude = data[0]
    const speed = data[3]
    const dms = this.degreesToDms(longitude)
    const retrograde = this.isRetrograde(speed)

    return {
      position: {
        ...dms,
        longitude
      },
      speed,
      retrograde,
      sign: this.zodiacSign(longitude)
    }
  }

  public planets = (
    date: Date
  ): { names: PlanetName[]; positions: Position[]; signs: Sign[] } => {
    const planetArr = Object.keys(PLANETS).reduce((accumulator, name) => {
      const planetPosition = this.position(name, date)

      accumulator[name] = {
        name,
        ...planetPosition,
        type: planetsByType[name]
      }

      return accumulator
    }, {}) as Planets

    const names = [
      planetArr.sun!.name,
      planetArr.moon!.name,
      planetArr.mercury!.name,
      planetArr.venus!.name,
      planetArr.mars!.name,
      planetArr.jupiter!.name,
      planetArr.saturn!.name,
      planetArr.uranus!.name,
      planetArr.neptune!.name,
      planetArr.pluto!.name
    ].map(
      (name) => (name?.charAt(0).toUpperCase() + name?.slice(1)) as PlanetName
    )

    const positions = [
      planetArr.sun!.position,
      planetArr.moon!.position,
      planetArr.mercury!.position,
      planetArr.venus!.position,
      planetArr.mars!.position,
      planetArr.jupiter!.position,
      planetArr.saturn!.position,
      planetArr.uranus!.position,
      planetArr.neptune!.position,
      planetArr.pluto!.position
    ]

    const signs = [
      Sign[planetArr.sun!.sign],
      Sign[planetArr.moon!.sign],
      Sign[planetArr.mercury!.sign],
      Sign[planetArr.venus!.sign],
      Sign[planetArr.mars!.sign],
      Sign[planetArr.jupiter!.sign],
      Sign[planetArr.saturn!.sign],
      Sign[planetArr.uranus!.sign],
      Sign[planetArr.neptune!.sign],
      Sign[planetArr.pluto!.sign]
    ] as unknown as Sign[]

    return { names, positions, signs }
  }
}
