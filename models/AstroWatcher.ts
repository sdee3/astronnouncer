import sweph from 'sweph'
import {
  FLAG,
  PLANETS,
  PlanetDataByDate,
  PlanetName,
  Planets,
  PositionWithSign,
  Sign,
  planetsByType
} from '../utils'

export class AstroWatcher {
  private previousPlanetPositions: Map<PlanetName, PositionWithSign> = new Map()

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

  public getPositionOfAstro = (
    astro: keyof typeof PLANETS,
    julianDay: number
  ) => sweph.calc(julianDay, PLANETS[astro], FLAG)

  public isRetrograde = (speed: number) => speed < 0

  public position = (astrologyObject: keyof typeof PLANETS, moment: Date) => {
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

  public planets = (date: Date): PlanetDataByDate => {
    const planetArr = Object.keys(PLANETS).reduce((accumulator, name) => {
      const planetPosition = this.position(name as keyof typeof PLANETS, date)

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
      planetArr.sun!.sign,
      planetArr.moon!.sign,
      planetArr.mercury!.sign,
      planetArr.venus!.sign,
      planetArr.mars!.sign,
      planetArr.jupiter!.sign,
      planetArr.saturn!.sign,
      planetArr.uranus!.sign,
      planetArr.neptune!.sign,
      planetArr.pluto!.sign
    ] as Sign[]

    const retrogrades = [
      planetArr.sun!.retrograde,
      planetArr.moon!.retrograde,
      planetArr.mercury!.retrograde,
      planetArr.venus!.retrograde,
      planetArr.mars!.retrograde,
      planetArr.jupiter!.retrograde,
      planetArr.saturn!.retrograde,
      planetArr.uranus!.retrograde,
      planetArr.neptune!.retrograde,
      planetArr.pluto!.retrograde
    ]

    return { names, positions, signs, retrogrades }
  }

  public getPlanetsWithChangedSigns = ():
    | { name: PlanetName; sign: Sign }[]
    | [] => {
    const { positions, names, signs } = this.planets(new Date())

    let previousSize = this.previousPlanetPositions.size
    let changedPlanets: { name: PlanetName; sign: Sign }[] = []

    positions.forEach(async (position, index) => {
      const previousPosition = this.previousPlanetPositions.get(names[index])

      if (
        previousPosition?.position.degrees === position.degrees &&
        previousPosition?.position.minutes === position.minutes &&
        previousPosition?.sign === signs[index] &&
        this.previousPlanetPositions.size > 0
      ) {
        // The previous and current value is the same, so we don't need to send a message
        return
      }

      this.previousPlanetPositions.set(names[index], {
        position: positions[index],
        sign: signs[index] as unknown as Sign
      })

      if (previousSize === 0) {
        // We don't want to send a message on the first run
        return
      }

      if (
        position.degrees === 0 &&
        position.minutes === 0 &&
        previousPosition?.position.degrees !== 0 &&
        previousPosition?.position.minutes !== 0
      ) {
        // The planet has changed signs, so we return it
        const name = names[index]

        changedPlanets.push({ name, sign: signs[index] })
      }
    })

    return changedPlanets
  }
}
