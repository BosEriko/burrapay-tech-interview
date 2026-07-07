import { Option, Either } from "effect"
import { Tournament, Player } from '../types/index.ts'
import { v4 as uuidv4 } from 'uuid'

// Storage interfaces
export interface TournamentStorage {
  tournaments: Map<string, Tournament>
  players: Map<string, Player>
}

// Create initial storage
export const createStorage = (): TournamentStorage => ({
  tournaments: new Map<string, Tournament>(),
  players: new Map<string, Player>()
})

// Storage instance
export const storage = createStorage()

// Tournament operations
export const createTournament = (name: string, isMega: boolean): Either.Either<Tournament, string> => {
  const tournament: Tournament = {
    id: uuidv4(),
    name,
    isMega,
    createdAt: new Date()
  }
  storage.tournaments.set(tournament.id, tournament)
  return Either.right(tournament)
}

export const getTournament = (id: string): Option.Option<Tournament> => {
  return Option.fromNullable(storage.tournaments.get(id))
}

export const getAllTournaments = (): Tournament[] => {
  return Array.from(storage.tournaments.values())
}

// Player operations
export const createPlayer = (name: string, tournamentId: string, pokemonData: {
  id: number
  types: string[]
  height: number
  weight: number
}): Either.Either<Player, string> => {
  const tournament = getTournament(tournamentId)
  if (Option.isNone(tournament)) {
    return Either.left('Tournament not found')
  }
  const player: Player = {
    id: uuidv4(),
    name,
    tournamentId,
    pokemonData
  }
  storage.players.set(player.id, player)
  return Either.right(player)
}

export const getPlayer = (id: string): Option.Option<Player> => {
  return Option.fromNullable(storage.players.get(id))
}

export const getAllPlayers = (): Player[] => {
  return Array.from(storage.players.values())
}

export const getPlayersByTournament = (tournamentId: string): Player[] => {
  return Array.from(storage.players.values()).filter(
    player => player.tournamentId === tournamentId
  )
}
