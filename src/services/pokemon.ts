import * as TE from 'fp-ts/lib/TaskEither'
import { PokemonApiResponse } from '../types/index.ts'

const pokemonCache = new Map<string, PokemonApiResponse>()

const requestTimestamps: number[] = []
const MAX_REQUESTS = 10
const WINDOW_MS = 10000

const isRateLimited = (): boolean => {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift()
  }
  return requestTimestamps.length >= MAX_REQUESTS
}

const log = (message: string, data: Record<string, unknown> = {}) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }))
  }
}

export const fetchPokemon = (name: string): TE.TaskEither<string, PokemonApiResponse> => {
  const normalized = name.toLowerCase()
  const cached = pokemonCache.get(normalized)

  if (cached) {
    log('Pokemon cache hit', { name: normalized })
    return TE.right(cached)
  }

  if (isRateLimited()) {
    log('Pokemon API rate limited', { name: normalized })
    return TE.left('Pokemon API rate limit exceeded, please try again later')
  }

  return TE.tryCatch(
    () => {
      requestTimestamps.push(Date.now())
      log('Pokemon API fetch', { name: normalized })
      return fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`).then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json() as Promise<PokemonApiResponse>
      }).then(data => {
        pokemonCache.set(normalized, data)
        log('Pokemon cached', { name: normalized, pokemonId: data.id })
        return data
      })
    },
    (error) => {
      log('Pokemon API error', { name: normalized, error: String(error) })
      return 'Name is not a valid Pokemon'
    }
  )
}
