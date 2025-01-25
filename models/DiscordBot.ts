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
  CHANNEL_CHECK_INTERVAL,
  DISCORD_BOT_TOKEN,
  MY_GENERAL_CHANNEL_ID,
  MY_TEST_CHANNEL_ID,
  NODE_ENV
} from '../config'
import { Aspect, PlanetName, Sign } from '../utils'

export class DiscordBot {
  private messageInterval: NodeJS.Timer | null = null

  private fetchChannelsInterval: NodeJS.Timer | null = null

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

      if (generalChannelId) {
        this.channelList.push(generalChannelId)
      }

      // Check for dedicated #announcements on Cam's server
      const dedicatedAnnouncementsChannel = guildChannels?.find(
        (c) => c?.name === 'astronouncements'
      )?.id

      if (dedicatedAnnouncementsChannel) {
        this.channelList.push(dedicatedAnnouncementsChannel)
      }
    })

    this.client.on(Events.GuildDelete, async (guild) => {
      const guildChannels = await guild.channels.fetch()

      const generalChannelId = guildChannels?.find(
        (c) => c?.name === 'general'
      )?.id

      if (!generalChannelId) return

      this.channelList = this.channelList.filter((c) => c !== generalChannelId)
    })

    this.client.on(Events.ClientReady, async () => {
      console.info('Bot is ready!')

      this.fetchChannelsInterval = setInterval(
        async () => await this.fetchChannels(),
        CHANNEL_CHECK_INTERVAL
      )

      this.messageInterval = setInterval(
        async () => await this.checkPlanets(aspectChecker),
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

  private fetchChannels = async () => {
    if (!this.client) return

    if (NODE_ENV === 'development') {
      if (!this.channelList.includes(MY_TEST_CHANNEL_ID)) {
        console.log("[DEV ENV] Connecting only to Stefan's test channel...")

        this.channelList.push(MY_TEST_CHANNEL_ID)

        return
      }

      return
    }

    const guilds = this.client.guilds.cache

    guilds.forEach((guild) => this.populateChannelList(guild))
  }

  private checkPlanets = async (aspectChecker: AspectChecker) => {
    this.parsePlanetPositions()
    await aspectChecker.checkForConjunction()
    await aspectChecker.checkForRetrograde()
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

    if (this.fetchChannelsInterval !== null) {
      clearInterval(this.fetchChannelsInterval)
      this.fetchChannelsInterval = null
    }
  }

  public getFormattedMessageForPlanet = (
    planetName: PlanetName,
    sign: Sign
  ): string => {
    return `${planetName} has entered ${Sign[sign]}!`
  }

  public getFormattedMessageForRetrograde = (
    planetName: PlanetName,
    sign: Sign,
    isRetrograde: boolean
  ): string => {
    return `${planetName} has ${
      isRetrograde ? 'entered' : 'left'
    } retrograde in ${Sign[sign]}!`
  }

  public getFormattedMessageForAspect = (
    planetName: PlanetName,
    planetName2: PlanetName,
    sign: Sign,
    sign2: Sign,
    aspect: Aspect
  ): string | null => {
    if (
      aspect === 'conjunction' &&
      (planetName === 'Sun' || planetName2 === 'Sun') &&
      planetName !== 'Moon' &&
      planetName2 !== 'Moon'
    ) {
      return `${planetName2} Cazimi in ${Sign[sign]}!`
    }

    if (
      aspect === 'conjunction' &&
      planetName === 'Moon' &&
      planetName2 === 'Sun'
    ) {
      return `New Moon in ${Sign[sign]}!`
    }

    if (
      aspect === 'opposition' &&
      planetName === 'Moon' &&
      planetName2 === 'Sun'
    ) {
      return `Full Moon in ${Sign[sign]}!`
    }

    if (
      planetName === 'Moon' &&
      planetName2 === 'Sun' &&
      (aspect === 'sextile' || aspect === 'square' || aspect === 'trine')
    ) {
      return null
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

      await this.sendMessageToChannels(message)
    })
  }
}
