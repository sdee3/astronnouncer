import { DatabaseSync } from 'node:sqlite'
import fs from 'fs'
import path from 'path'
import { AstroWatcher } from '../models/AstroWatcher'
import { Aspect, PlanetName, Sign } from '../utils'
import { aspectKey, retrogradeKey, signIngressKey } from './eventKeys'
import { SCHEMA } from './schema'

const ASPECT_DEGREES: { aspect: Aspect; degreeDiff: number }[] = [
  { aspect: 'sextile', degreeDiff: 60 },
  { aspect: 'square', degreeDiff: 90 },
  { aspect: 'trine', degreeDiff: 120 },
  { aspect: 'opposition', degreeDiff: 180 }
]

export class AnnouncementStore {
  private readonly db: DatabaseSync

  private readonly cache = new Set<string>()

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    this.db = new DatabaseSync(dbPath)
    this.db.exec('PRAGMA journal_mode = WAL')
    this.db.exec(SCHEMA)

    const rows = this.db
      .prepare('SELECT event_key FROM announced_events')
      .all() as { event_key: string }[]

    rows.forEach((row) => this.cache.add(row.event_key))
  }

  public has = (eventKey: string): boolean => this.cache.has(eventKey)

  public mark = (
    eventKey: string,
    eventType: string,
    payload?: Record<string, unknown>
  ): void => {
    this.db
      .prepare(
        `INSERT OR IGNORE INTO announced_events
         (event_key, event_type, announced_at, payload)
         VALUES (?, ?, ?, ?)`
      )
      .run(
        eventKey,
        eventType,
        new Date().toISOString(),
        payload ? JSON.stringify(payload) : null
      )

    this.cache.add(eventKey)
  }

  public bootstrap = (astroWatcher: AstroWatcher): void => {
    const { names, signs, retrogrades, positions } = astroWatcher.planets(
      new Date()
    )

    names.forEach((planet, index) => {
      this.mark(signIngressKey(planet, signs[index]), 'sign_ingress', {
        planet,
        sign: signs[index],
        bootstrap: true
      })

      this.mark(
        retrogradeKey(planet, retrogrades[index], signs[index]),
        'retrograde',
        {
          planet,
          isRetrograde: retrogrades[index],
          sign: signs[index],
          bootstrap: true
        }
      )
    })

    this.bootstrapConjunctions(names, signs, positions)
    ASPECT_DEGREES.forEach(({ aspect, degreeDiff }) =>
      this.bootstrapAspects(
        astroWatcher,
        names,
        signs,
        positions,
        aspect,
        degreeDiff
      )
    )

    console.info(
      `Announcement store bootstrapped with ${this.cache.size} event keys`
    )
  }

  private bootstrapConjunctions = (
    names: PlanetName[],
    signs: Sign[],
    positions: { degrees: number; minutes: number }[]
  ): void => {
    positions.forEach((position, index) => {
      const planetName = names[index]

      positions.forEach((position2, index2) => {
        const planetName2 = names[index2]

        if (planetName >= planetName2) return

        if (
          position.degrees === position2.degrees &&
          position.minutes === position2.minutes &&
          signs[index] === signs[index2]
        ) {
          this.mark(
            aspectKey(
              planetName,
              planetName2,
              signs[index],
              signs[index2],
              'conjunction'
            ),
            'aspect',
            { bootstrap: true }
          )
        }
      })
    })
  }

  private bootstrapAspects = (
    astroWatcher: AstroWatcher,
    names: PlanetName[],
    signs: Sign[],
    positions: { degrees: number; minutes: number }[],
    aspect: Aspect,
    degreeDiff: number
  ): void => {
    positions.forEach((position, index) => {
      const planetName = names[index]

      positions.forEach((position2, index2) => {
        const planetName2 = names[index2]

        if (planetName >= planetName2) return

        const calculatedDegreeDiff = Math.abs(
          astroWatcher.normalizeDegrees(
            position.degrees +
              signs[index] * 30 -
              (position2.degrees + signs[index2] * 30)
          )
        )

        const minuteDiff = position.minutes - position2.minutes

        if (calculatedDegreeDiff === degreeDiff && minuteDiff === 0) {
          this.mark(
            aspectKey(
              planetName,
              planetName2,
              signs[index],
              signs[index2],
              aspect
            ),
            'aspect',
            { bootstrap: true }
          )
        }
      })
    })
  }
}
