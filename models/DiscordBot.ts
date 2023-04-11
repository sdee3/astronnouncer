import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js'
import { AstroWatcher } from './AstroWatcher'
import { AspectChecker } from './AspectChecker'
import {
  ASTRO_CHECK_INTERVAL,
  DISCORD_BOT_TOKEN,
  GENERAL_CHANNEL_ID
} from '../config'
import { Aspect, PlanetName, Sign } from '../utils'

export class DiscordBot {
  private messageInterval: NodeJS.Timer | null = null

  constructor(private readonly astroWatcher: AstroWatcher) {
    const client = new Client({
      intents: [GatewayIntentBits.MessageContent]
    })

    const aspectChecker = new AspectChecker(astroWatcher, this)

    client.on(Events.ClientReady, async (client) => {
      const channel = await client.channels.fetch(GENERAL_CHANNEL_ID)

      if (!channel) {
        return
      }

      console.info('Bot is ready!')

      this.messageInterval = setInterval(async () => {
        this.parsePlanetPositions(channel as TextChannel)
        aspectChecker.checkForConjunction(channel as TextChannel)
        await aspectChecker.checkForAspect(
          channel as TextChannel,
          'sextile',
          60
        )
        await aspectChecker.checkForAspect(channel as TextChannel, 'square', 90)
        await aspectChecker.checkForAspect(channel as TextChannel, 'trine', 120)
        await aspectChecker.checkForAspect(
          channel as TextChannel,
          'opposition',
          180
        )
      }, ASTRO_CHECK_INTERVAL)
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

  public getFormattedMessageForPlanet = (
    planetName: PlanetName,
    sign: Sign
  ): string | null => {
    return `${planetName} has entered ${Sign[sign]}!`
  }

  public getFormattedMessageForAspect = (
    planetName: PlanetName,
    planetName2: PlanetName,
    sign: Sign,
    sign2: Sign,
    aspect: Aspect
  ): string | null => {
    return `${planetName} in ${Sign[sign]} is making a ${aspect} to ${planetName2} in ${Sign[sign2]}!`
  }

  private parsePlanetPositions = async (channel: TextChannel) => {
    const changedPlanets = this.astroWatcher.getPlanetsWithChangedSigns()

    changedPlanets.forEach(async ({ name, sign }) => {
      const message = this.getFormattedMessageForPlanet(name, sign)

      if (!message) return

      await channel.send(message as string)
    })
  }
}
