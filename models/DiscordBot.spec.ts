import { Client, TextChannel } from 'discord.js'
import { AstroWatcher } from './AstroWatcher'
import { DiscordBot } from './DiscordBot'
import { Sign } from '../utils'

jest.useFakeTimers()

jest.mock('discord.js', () => {
  const { EventEmitter } = require('events')

  class Client extends EventEmitter {
    public login = jest.fn()
    public channels = {
      fetch: jest.fn()
    }
  }

  return {
    Client,
    Events: {
      ClientReady: 'ready',
      ChannelDelete: 'channelDelete',
      Error: 'error'
    },
    GatewayIntentBits: {
      MessageContent: 1
    },
    TextChannel: jest.fn()
  }
})

describe('DiscordBot', () => {
  const mockChannelSend = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send a message to the channel when a planet changes signs', async () => {
    const client = new Client({ intents: [] })

    // Mock channel fetch
    const mockChannelFetch = jest.spyOn(client.channels, 'fetch')

    mockChannelFetch.mockResolvedValueOnce({
      id: '1234',
      send: mockChannelSend
    } as unknown as TextChannel)

    const planetWatcher = new AstroWatcher()
    const bot = new DiscordBot(planetWatcher)

    const previousPlanetData = {
      position: { degrees: 29, minutes: 59, seconds: 0, longitude: 0 },
      sign: Sign.Aquarius
    }

    const positions = [{ degrees: 0, minutes: 0, seconds: 0, longitude: 0 }]
    const signs = [Sign.Pisces]
    const planetName = 'Mars'
    const sign = Sign.Pisces

    bot['previousPlanetPositions'].set(planetName, previousPlanetData)

    // Mock planet positions and names
    jest.spyOn(planetWatcher, 'planets').mockReturnValueOnce({
      positions,
      names: [planetName],
      signs
    })

    // Call fetchPlanetaryPositions
    bot['fetchPlanetaryPositions'](
      (await client.channels.fetch('1234')) as TextChannel
    )

    // Fast-forward until the next interval
    jest.advanceTimersByTime(30000)

    // Expect message to have been sent to the channel
    expect(mockChannelSend).toHaveBeenCalledWith(
      `${planetName} is at ${positions[0].degrees}°${positions[0].minutes}' ${sign}`
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
