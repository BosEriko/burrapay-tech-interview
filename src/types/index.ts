import * as t from 'fp-ts/lib/struct'

// Tournament interface
export interface Tournament {
  id: string
  name: string
  isMega: boolean
  createdAt: Date
}

// Player interface (Pokemon only!)
export interface Player {
  id: string
  name: string
  tournamentId: string
  pokemonData: {
    id: number
    types: string[]
    height: number
    weight: number
  }
}

// Pokemon API response type (for reference)
export interface PokemonApiResponse {
  id: number
  name: string
  types: Array<{
    type: {
      name: string
    }
  }>
  height: number
  weight: number
}

// Request types for creating tournaments
export interface CreateTournamentRequest {
  name: string
  isMega: boolean
}

// Request types for adding players
export interface CreatePlayerRequest {
  name: string
}

// Response types
export interface TournamentResponse {
  id: string
  name: string
  isMega: boolean
  createdAt: string
}

export interface PlayerResponse {
  id: string
  name: string
  tournamentId: string
}

export interface PlayerError {
  readonly statusCode: number
  readonly message: string
}