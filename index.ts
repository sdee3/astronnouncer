import { AstroWatcher, DiscordBot } from './models'
import { AnnouncementStore } from './db'
import { DATABASE_PATH } from './config'
import sweph from 'sweph'
import path from 'path'

sweph.set_ephe_path(path.join(__dirname, '../public'))

const store = new AnnouncementStore(DATABASE_PATH)
const astroWatcher = new AstroWatcher()

store.bootstrap(astroWatcher)

new DiscordBot(astroWatcher, store)
