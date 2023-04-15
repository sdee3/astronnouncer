import {
  Client,
  Events,
  GatewayIntentBits,
  Guild,
  TextChannel
} from 'discord.js'
import { AstroWatcher } from './AstroWatcher'
import { AspectChecker } from './AspectChecker'
import {
  ASTRO_CHECK_INTERVAL,
  DISCORD_BOT_TOKEN,
  MY_GENERAL_CHANNEL_ID,
  MY_TEST_CHANNEL_ID
} from '../config'
import { Aspect, PlanetName, Sign } from '../utils'

export class DiscordBot {
  private messageInterval: NodeJS.Timer | null = null

  private channelList: string[] = []

  private client: Client | null = null

  constructor(private readonly astroWatcher: AstroWatcher) {
    this.client = new Client({
      intents: [GatewayIntentBits.MessageContent]
    })

    const aspectChecker = new AspectChecker(astroWatcher, this)

    this.client.on(Events.GuildCreate, async (guild) => {
      const guildChannels = await guild.channels.fetch()

      const generalChannelId = guildChannels?.find(
        (c) => c?.name === 'general'
      )?.id

      if (!generalChannelId) return

      this.channelList.push(generalChannelId)
    })

    this.client.on(Events.GuildDelete, async (guild) => {
      const guildChannels = await guild.channels.fetch()

      const generalChannelId = guildChannels?.find(
        (c) => c?.name === 'general'
      )?.id

      if (!generalChannelId) return

      this.channelList = this.channelList.filter((c) => c !== generalChannelId)
    })

    this.client.on(Events.ClientReady, async (client) => {
      console.info('Bot is ready!')

      this.messageInterval = setInterval(
        async () => await this.fetchChannelsAndStartEmit(aspectChecker),
        ASTRO_CHECK_INTERVAL
      )
    })

    process.on('exit', this.clearInterval)

    this.client.on(Events.ChannelDelete, () => this.clearInterval())

    this.client.on(Events.Error, () => this.clearInterval())

    this.client.login(DISCORD_BOT_TOKEN)
  }

  public sendMessageToChannels = async (message: string) => {
    if (!this.client) {
      console.error('Client is not initialized')

      return
    }

    this.channelList.forEach(async (channelId) => {
      if (!this.client) {
        console.error('Client is not initialized')

        return
      }

      const channel = await this.client.channels.fetch(channelId)

      if (!channel) return

      await (channel as TextChannel).send(message)
    })
  }

  private fetchChannelsAndStartEmit = async (aspectChecker: AspectChecker) => {
    if (!this.client) return

    const guilds = this.client.guilds.cache

    guilds.forEach((guild) => this.populateChannelList(guild))

    this.parsePlanetPositions()
    aspectChecker.checkForConjunction()
    await aspectChecker.checkForAspect('sextile', 60)
    await aspectChecker.checkForAspect('square', 90)
    await aspectChecker.checkForAspect('trine', 120)
    await aspectChecker.checkForAspect('opposition', 180)
  }

  private populateChannelList = async (guild: Guild) => {
    const fetchedGuild = await guild.fetch()
    const guildChannels = await guild.channels.fetch()

    const generalChannelId = guildChannels?.find(
      (c) => c?.name === 'general'
    )?.id

    if (!generalChannelId) {
      return
    }

    if (this.channelList.includes(generalChannelId)) {
      return
    }

    if (
      generalChannelId === MY_GENERAL_CHANNEL_ID &&
      !this.channelList.includes(MY_TEST_CHANNEL_ID)
    ) {
      console.info("Connecting to Stefan's test channel...")

      this.channelList.push(MY_TEST_CHANNEL_ID)

      return
    }

    if (
      generalChannelId === MY_GENERAL_CHANNEL_ID &&
      this.channelList.includes(MY_TEST_CHANNEL_ID)
    ) {
      return
    }

    this.channelList.push(generalChannelId)

    console.info('Adding channel from Discord server:', fetchedGuild.name)
    console.info('Channel added:', generalChannelId)
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
    if (aspect === 'conjunction' && planetName === 'Sun') {
      return `${planetName2} Cazimi!`
    }

    if (
      aspect === 'conjunction' &&
      planetName === 'Sun' &&
      planetName2 === 'Moon'
    ) {
      return `New Moon in ${Sign[sign]}!`
    }

    if (
      aspect === 'opposition' &&
      planetName === 'Sun' &&
      planetName2 === 'Moon'
    ) {
      return `Full Moon in ${Sign[sign]}!`
    }

    if (aspect === 'opposition') {
      return `${planetName} in ${Sign[sign]} is making an ${aspect} to ${planetName2} in ${Sign[sign2]}!`
    }

    return `${planetName} in ${Sign[sign]} is making a ${aspect} to ${planetName2} in ${Sign[sign2]}!`
  }

  private parsePlanetPositions = async () => {
    const changedPlanets = this.astroWatcher.getPlanetsWithChangedSigns()

    changedPlanets.forEach(async ({ name, sign }) => {
      const message = this.getFormattedMessageForPlanet(name, sign)

      if (!message) return

      await this.sendMessageToChannels(message)
    })
  }
}
