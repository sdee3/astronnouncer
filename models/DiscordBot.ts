import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js'
import { AstroWatcher } from './AstroWatcher'
import {
  ASTRO_CHECK_INTERVAL,
  DISCORD_BOT_TOKEN,
  GENERAL_CHANNEL_ID
} from '../config'

export class DiscordBot {
  private messageInterval: NodeJS.Timer | null = null

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

      console.log('Mars:', planets.mars?.position)

      // channel.send('HI!')
    }, ASTRO_CHECK_INTERVAL)

    return interval
  }
}
