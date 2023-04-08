import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js'
import { AstroWatcher } from './AstroWatcher'
import {
  ASTRO_CHECK_INTERVAL,
  DISCORD_BOT_TOKEN,
  GENERAL_CHANNEL_ID
} from '../config'
import { PlanetName, PositionWithSign, Sign } from '../utils'

export class DiscordBot {
  private messageInterval: NodeJS.Timer | null = null

  private previousPlanetPositions: Map<PlanetName, PositionWithSign> = new Map()

  constructor(private astroWatcher: AstroWatcher) {
    const client = new Client({
      intents: [GatewayIntentBits.MessageContent]
    })

    client.on(Events.ClientReady, async (client) => {
      const channel = await client.channels.fetch(GENERAL_CHANNEL_ID)

      if (!channel) {
        return
      }

      await (channel as TextChannel).send(
        'Hello, I am Astronnouncer! I will notify you as soon as a planet changes signs!'
      )

      this.messageInterval = this.fetchPlanetaryPositions(
        channel as TextChannel
      )
    })

    process.on('exit', this.clearInterval)

    client.on(Events.ChannelDelete, () => this.clearInterval())

    client.on(Events.Error, () => this.clearInterval())

    client.login(DISCORD_BOT_TOKEN)
  }

  private clearInterval() {
    if (this.messageInterval !== null) {
      clearInterval(this.messageInterval)
      this.messageInterval = null
    }
  }

  private fetchPlanetaryPositions = (channel: TextChannel) => {
    const interval = setInterval(async () => {
      const { positions, names, signs } = this.astroWatcher.planets(new Date())
      let previousSize = this.previousPlanetPositions.size

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
          // The planet has changed signs, so we send a message
          const name = names[index]
          const message = this.getFormattedMessageForPlanet(name)

          if (!message) return

          await channel.send(message as string)
        }
      })
    }, ASTRO_CHECK_INTERVAL)

    return interval
  }

  /**
   * Retrieves a message for the Discord channel saying that a planet changed signs.
   */
  private getFormattedMessageForPlanet = (
    planetName: PlanetName
  ): string | null => {
    const planetData = this.previousPlanetPositions.get(planetName)

    if (!planetData) return null

    const { sign } = planetData

    return `${planetName} entered ${sign}!`
  }
}
