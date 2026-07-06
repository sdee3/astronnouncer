import {
  aspectKey,
  retrogradeKey,
  signIngressKey,
  utcDay
} from './eventKeys'

describe('eventKeys', () => {
  const dayOne = new Date('2026-03-01T12:00:00.000Z')
  const dayTwo = new Date('2026-03-16T12:00:00.000Z')

  it('creates distinct sign ingress keys for re-entries into the same sign', () => {
    const first = signIngressKey('Mercury', 1, dayOne)
    const second = signIngressKey('Mercury', 1, dayTwo)

    expect(first).toBe('ingress:Mercury:1:2026-03-01')
    expect(second).toBe('ingress:Mercury:1:2026-03-16')
    expect(first).not.toBe(second)
  })

  it('creates distinct retrograde keys for repeated states on different days', () => {
    const first = retrogradeKey('Mercury', true, 1, dayOne)
    const second = retrogradeKey('Mercury', true, 1, dayTwo)

    expect(first).not.toBe(second)
  })

  it('creates distinct aspect keys for recurring lunar aspects', () => {
    const march = aspectKey('Moon', 'Uranus', 12, 3, 'square', 14, 0, 14, 0)
    const april = aspectKey('Moon', 'Uranus', 12, 3, 'square', 18, 0, 18, 0)

    expect(march).toBe('aspect:square:Moon:Uranus:12:3:14:0:14:0')
    expect(april).toBe('aspect:square:Moon:Uranus:12:3:18:0:18:0')
    expect(march).not.toBe(april)
  })

  it('reuses the same aspect key while an exact aspect persists', () => {
    const first = aspectKey('Venus', 'Mars', 5, 9, 'square', 15, 30, 15, 30)
    const second = aspectKey('Venus', 'Mars', 5, 9, 'square', 15, 30, 15, 30)

    expect(first).toBe('aspect:square:Mars:Venus:9:5:15:30:15:30')
    expect(first).toBe(second)
    expect(utcDay(dayOne)).toBe('2026-03-01')
  })
})
