import { AnnouncementStore, aspectKey, retrogradeKey } from '../db'
import { AstroWatcher } from './AstroWatcher'
import { DiscordBot } from './DiscordBot'
import { Aspect, PlanetName, Sign, isFasterPlanetFirst } from '../utils'

export class AspectChecker {
  private readonly retrogradeState = new Map<PlanetName, boolean>()

  constructor(
    private readonly astroWatcher: AstroWatcher,
    private readonly discordBot: DiscordBot,
    private readonly store: AnnouncementStore
  ) {}

  public seedRetrogradeStates = (
    names: PlanetName[],
    retrogrades: boolean[]
  ): void => {
    names.forEach((planet, index) => {
      this.retrogradeState.set(planet, retrogrades[index])
    })
  }

  public checkForConjunction = async () => {
    const { positions, names, signs, retrogrades } = this.astroWatcher.planets(
      new Date()
    )

    positions.forEach(async (position, index) => {
      const planetName = names[index]

      positions.forEach(async (position2, index2) => {
        const planetName2 = names[index2]

        if (!isFasterPlanetFirst(planetName, planetName2)) return

        if (
          position.degrees === position2.degrees &&
          position.minutes === position2.minutes &&
          signs[index] === signs[index2]
        ) {
          const message = this.discordBot.getFormattedMessageForAspect(
            planetName,
            planetName2,
            signs[index],
            signs[index2],
            'conjunction',
            retrogrades[index],
            retrogrades[index2]
          )

          if (!message) return

          const key = aspectKey(
            planetName,
            planetName2,
            signs[index],
            signs[index2],
            'conjunction',
            position.degrees,
            position.minutes,
            position2.degrees,
            position2.minutes
          )

          if (this.store.has(key)) return

          this.store.mark(key, 'aspect', {
            planetName1: planetName,
            planetName2,
            aspect: 'conjunction'
          })

          await this.discordBot.sendMessageToChannels(message as string)
        }
      })
    })
  }

  public checkForRetrograde = async () => {
    const { retrogrades, names, signs } = this.astroWatcher.planets(new Date())

    retrogrades.forEach(async (retrograde, index) => {
      const planetName = names[index]
      const sign = signs[index]

      if (planetName === 'Sun' || planetName === 'Moon') return

      const previousRetrograde = this.retrogradeState.get(planetName)

      if (previousRetrograde === undefined) {
        this.retrogradeState.set(planetName, retrograde)
        return
      }

      if (previousRetrograde === retrograde) return

      this.retrogradeState.set(planetName, retrograde)

      const key = retrogradeKey(planetName, retrograde, sign)

      if (this.store.has(key)) return

      const message = this.discordBot.getFormattedMessageForRetrograde(
        planetName,
        sign,
        retrograde
      )

      this.store.mark(key, 'retrograde', {
        planetName,
        isRetrograde: retrograde,
        sign
      })

      await this.discordBot.sendMessageToChannels(message as string)
    })
  }

  public checkForAspect = async (aspect: Aspect, degreeDiff: number) => {
    const { positions, names, signs, retrogrades } = this.astroWatcher.planets(
      new Date()
    )

    positions.forEach(async (position, index) => {
      const planetName = names[index]

      positions.forEach(async (position2, index2) => {
        const planetName2 = names[index2]

        if (!isFasterPlanetFirst(planetName, planetName2)) return

        const calculatedDegreeDiff = Math.abs(
          this.astroWatcher.normalizeDegrees(
            position.degrees +
              signs[index] * 30 -
              (position2.degrees + signs[index2] * 30)
          )
        )

        const minuteDiff = position.minutes - position2.minutes

        if (calculatedDegreeDiff === degreeDiff && minuteDiff === 0) {
          const message = this.discordBot.getFormattedMessageForAspect(
            planetName,
            planetName2,
            signs[index],
            signs[index2],
            aspect,
            retrogrades[index],
            retrogrades[index2]
          )

          if (!message) return

          const key = aspectKey(
            planetName,
            planetName2,
            signs[index],
            signs[index2],
            aspect,
            position.degrees,
            position.minutes,
            position2.degrees,
            position2.minutes
          )

          if (this.store.has(key)) return

          this.store.mark(key, 'aspect', {
            planetName1: planetName,
            planetName2,
            aspect
          })

          await this.discordBot.sendMessageToChannels(message as string)
        }
      })
    })
  }
}
