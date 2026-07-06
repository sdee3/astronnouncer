import { AnnouncementStore, aspectKey, retrogradeKey } from '../db'
import { AstroWatcher } from './AstroWatcher'
import { DiscordBot } from './DiscordBot'
import { Aspect, PlanetName, Sign } from '../utils'

export class AspectChecker {
  constructor(
    private readonly astroWatcher: AstroWatcher,
    private readonly discordBot: DiscordBot,
    private readonly store: AnnouncementStore
  ) {}

  public checkForConjunction = async () => {
    const { positions, names, signs } = this.astroWatcher.planets(new Date())

    positions.forEach(async (position, index) => {
      const planetName = names[index]

      positions.forEach(async (position2, index2) => {
        const planetName2 = names[index2]

        if (planetName === planetName2) return

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
            'conjunction'
          )

          if (!message) return

          if (
            this.hasAnnouncedAspect(
              planetName,
              planetName2,
              signs[index],
              signs[index2],
              'conjunction'
            )
          ) {
            return
          }

          const key = aspectKey(
            planetName,
            planetName2,
            signs[index],
            signs[index2],
            'conjunction'
          )

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

      const message = this.discordBot.getFormattedMessageForRetrograde(
        planetName,
        sign,
        retrograde
      )

      if (this.hasAnnouncedRetrograde(planetName, retrograde, sign)) return

      const key = retrogradeKey(planetName, retrograde, sign)

      this.store.mark(key, 'retrograde', {
        planetName,
        isRetrograde: retrograde,
        sign
      })

      await this.discordBot.sendMessageToChannels(message as string)
    })
  }

  public checkForAspect = async (aspect: Aspect, degreeDiff: number) => {
    const { positions, names, signs } = this.astroWatcher.planets(new Date())

    positions.forEach(async (position, index) => {
      const planetName = names[index]

      positions.forEach(async (position2, index2) => {
        const planetName2 = names[index2]

        if (planetName === planetName2) return

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
            aspect
          )

          if (!message) return

          if (
            this.hasAnnouncedAspect(
              planetName,
              planetName2,
              signs[index],
              signs[index2],
              aspect
            )
          ) {
            return
          }

          const key = aspectKey(
            planetName,
            planetName2,
            signs[index],
            signs[index2],
            aspect
          )

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

  private hasAnnouncedAspect = (
    planetName1: PlanetName,
    planetName2: PlanetName,
    sign1: Sign,
    sign2: Sign,
    aspect: Aspect
  ) => {
    if (planetName2 === 'Moon') return true

    return this.store.has(
      aspectKey(planetName1, planetName2, sign1, sign2, aspect)
    )
  }

  private hasAnnouncedRetrograde = (
    planetName: PlanetName,
    isRetrograde: boolean,
    sign: Sign
  ) => {
    if (planetName === 'Sun' || planetName === 'Moon') return true

    return this.store.has(retrogradeKey(planetName, isRetrograde, sign))
  }
}
