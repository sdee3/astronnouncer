import { AstroWatcher, DiscordBot } from './models'
import sweph from 'sweph'
import path from 'path'

sweph.set_ephe_path(path.join(__dirname, '/public'))

const astroWatcher = new AstroWatcher()
const discordBot = new DiscordBot(astroWatcher)
