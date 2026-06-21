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

export const fetchPokemon = (name: string): TE.TaskEither<string, PokemonApiResponse> => {
  const normalized = name.toLowerCase()
  const cached = pokemonCache.get(normalized)

  if (cached) {
    return TE.right(cached)
  }

  if (isRateLimited()) {
    return TE.left('Pokemon API rate limit exceeded, please try again later')
  }

  return TE.tryCatch(
    () => {
      requestTimestamps.push(Date.now())
      return fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`).then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json() as Promise<PokemonApiResponse>
      }).then(data => {
        pokemonCache.set(normalized, data)
        return data
      })
    },
    () => 'Name is not a valid Pokemon'
  )
}
