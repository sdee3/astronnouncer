import { AstroWatcher } from './AstroWatcher'
import { TextChannel } from 'discord.js'
import { DiscordBot } from './DiscordBot'
import { Aspect, AspectOccurrence, PlanetName, Sign } from '../utils'
import dayjs from 'dayjs'

export class AspectChecker {
  constructor(
    private readonly astroWatcher: AstroWatcher,
    private readonly discordBot: DiscordBot
  ) {}

  private aspectsOccurred: AspectOccurrence[] = []

  public checkForConjunction = () => {
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
              position.degrees,
              position2.degrees,
              'conjunction'
            )
          ) {
            return
          }

          this.aspectsOccurred.push({
            planetName1: planetName,
            planetName2,
            sign1: signs[index],
            sign2: signs[index2],
            degree1: position.degrees,
            degree2: position2.degrees,
            aspect: 'conjunction',
            date: dayjs().format('DD-MM-YYYY')
          })

          await this.discordBot.sendMessageToChannels(message as string)
        }
      })
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
              position.degrees,
              position2.degrees,
              aspect
            )
          ) {
            return
          }

          this.aspectsOccurred.push({
            planetName1: planetName,
            planetName2,
            sign1: signs[index],
            sign2: signs[index2],
            degree1: position.degrees,
            degree2: position2.degrees,
            aspect,
            date: dayjs().format('DD-MM-YYYY')
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
    degree1: number,
    degree2: number,
    aspect: Aspect
  ) => {
    const today = dayjs().format('DD-MM-YYYY')

    const aspectOccurred = this.aspectsOccurred.find(
      (aspectOccurrence) =>
        (aspectOccurrence.planetName1 === planetName1 ||
          aspectOccurrence.planetName1 === planetName2 ||
          aspectOccurrence.planetName2 === planetName1 ||
          aspectOccurrence.planetName2 === planetName2) &&
        (aspectOccurrence.sign1 === sign1 ||
          aspectOccurrence.sign1 === sign2 ||
          aspectOccurrence.sign2 === sign1 ||
          aspectOccurrence.sign2 === sign2) &&
        aspectOccurrence.degree1 === degree1 &&
        aspectOccurrence.degree2 === degree2 &&
        aspectOccurrence.aspect === aspect &&
        aspectOccurrence.date === today
    )

    return !!aspectOccurred || planetName2 === 'Moon'
  }
}
