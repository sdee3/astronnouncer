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

      this.messageInterval = this.fetchPlanetaryPositions(
        channel as TextChannel
      )
    })

    process.on('exit', () => this.clearInterval())

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
      const planets = this.astroWatcher.planets(new Date())

      const names = [
        planets.sun!.name,
        planets.moon!.name,
        planets.mercury!.name,
        planets.venus!.name,
        planets.mars!.name,
        planets.jupiter!.name,
        planets.saturn!.name,
        planets.uranus!.name,
        planets.neptune!.name,
        planets.pluto!.name
      ].map(
        (name) => name?.charAt(0).toUpperCase() + name?.slice(1)
      ) as PlanetName[]

      const positions = [
        planets.sun!.position,
        planets.moon!.position,
        planets.mercury!.position,
        planets.venus!.position,
        planets.mars!.position,
        planets.jupiter!.position,
        planets.saturn!.position,
        planets.uranus!.position,
        planets.neptune!.position,
        planets.pluto!.position
      ]

      const signs = [
        Sign[planets.sun!.sign],
        Sign[planets.moon!.sign],
        Sign[planets.mercury!.sign],
        Sign[planets.venus!.sign],
        Sign[planets.mars!.sign],
        Sign[planets.jupiter!.sign],
        Sign[planets.saturn!.sign],
        Sign[planets.uranus!.sign],
        Sign[planets.neptune!.sign],
        Sign[planets.pluto!.sign]
      ]

      positions.forEach((_, index) =>
        this.previousPlanetPositions.set(names[index], {
          position: positions[index],
          sign: signs[index] as unknown as Sign
        })
      )

      names.forEach((name) =>
        console.log(this.getFormattedMessageForPlanet(name))
      )

      // channel.send('HI!')
    }, ASTRO_CHECK_INTERVAL)

    return interval
  }

  private getFormattedMessageForPlanet = (
    planetName: PlanetName
  ): string | null => {
    const planetData = this.previousPlanetPositions.get(planetName)

    if (!planetData) return null

    const { position, sign } = planetData

    return `${planetName} is at ${position.degrees}°${position.minutes}' ${sign}`
  }
}
