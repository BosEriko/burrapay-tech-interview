import { FastifyInstance } from 'fastify'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { CreatePlayerRequest, Player, PlayerResponse, PokemonApiResponse } from '../types/index.ts'
import { createPlayer, getTournament, getPlayer, getAllPlayers, getPlayersByTournament } from '../storage/index.ts'
import { fetchPokemon } from '../services/pokemon.ts'

export async function playerRoutes(fastify: FastifyInstance) {
  fastify.post<{ Params: { tournamentId: string }, Body: CreatePlayerRequest, Reply: PlayerResponse | { error: string } }>('/tournaments/:tournamentId/players', async (request, reply) => {
    const { tournamentId } = request.params
    const { name } = request.body ?? {}

    if (typeof name !== 'string') {
      const message = 'Name is required'
      request.log.warn({ body: request.body }, message)
      return reply.status(400).send({ error: message })
    }

    const tournament = getTournament(tournamentId)
    if (O.isNone(tournament)) {
      const message = 'Tournament not found'
      request.log.warn({ tournamentId }, message)
      return reply.status(404).send({ error: message })
    }

    const handlePlayerData = (pokemonData: PokemonApiResponse) => {
      request.log.info({ pokemonName: name, pokemonId: pokemonData.id }, 'Pokemon validated')
      const playerResult = createPlayer(name, tournamentId, {
        id: pokemonData.id,
        types: pokemonData.types.map(t => t.type.name),
        height: pokemonData.height,
        weight: pokemonData.weight
      })

      return pipe(
        playerResult,
        E.fold(
          (error) => {
            request.log.error({ error }, 'Failed to create player')
            return reply.status(400).send({ error })
          },
          (player) => {
            request.log.info({ playerId: player.id, pokemonName: player.name, tournamentId }, 'Player added to tournament')
            const response: PlayerResponse = {
              id: player.id,
              name: player.name,
              tournamentId: player.tournamentId
            }
            return reply.status(201).send(response)
          }
        )
      )
    }

    return pipe(
      await fetchPokemon(name)(),
      E.fold(
        (error) => {
          request.log.warn({ pokemonName: name, error }, 'Pokemon validation failed')
          return reply.status(400).send({ error })
        },
        handlePlayerData
      )
    )
  })

  fastify.get<{ Params: { tournamentId: string }, Reply: Player[] | { error: string } }>('/tournaments/:tournamentId/players', async (request, reply) => {
    const { tournamentId } = request.params

    const tournament = getTournament(tournamentId)
    if (O.isNone(tournament)) {
      return reply.status(404).send({ error: 'Tournament not found' })
    }

    const players = getPlayersByTournament(tournamentId)
    return reply.status(200).send(players)
  })

  fastify.get<{ Params: { playerId: string }, Reply: Player | { error: string } }>('/players/:playerId', async (request, reply) => {
    const { playerId } = request.params

    return pipe(
      getPlayer(playerId),
      O.fold(
        () => reply.status(404).send({ error: 'Player not found' }),
        (player) => reply.status(200).send(player)
      )
    )
  })

  fastify.get<{ Reply: Player[] }>('/players', async (_request, reply) => {
    return reply.status(200).send(getAllPlayers())
  })
}
