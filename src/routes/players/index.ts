import { FastifyInstance } from 'fastify'
import { pipe, Option, Either, Effect } from "effect"
import { Player, PlayerResponse } from '../../types'
import { getTournament, getPlayer, getAllPlayers, getPlayersByTournament } from '../../storage'
import { decode, CreatePlayerValidation } from '../../validation'
import { validationStep } from './steps/validationStep'
import { checkTournamentStep } from './steps/checkTournamentStep'
import { checkMegaStep } from './steps/checkMegaStep'
import { fetchPokemonStep } from './steps/fetchPokemonStep'
import { createPlayerStep } from './steps/createPlayerStep'

export async function playerRoutes(fastify: FastifyInstance) {
  fastify.post<{ Params: { tournamentId: string }, Body: { name: string }, Reply: PlayerResponse | { error: string } }>('/tournaments/:tournamentId/players', async (request, reply) => {
    const { tournamentId } = request.params
    const decoded = decode(CreatePlayerValidation)(request.body)

    return await Effect.runPromise(
      pipe(
        decoded,
        validationStep(request),
        Either.match({
          onLeft: (e) => Effect.fail(e),
          onRight: (a) => Effect.succeed(a)
        }),
        checkTournamentStep(request, tournamentId),
        checkMegaStep(request),
        fetchPokemonStep(request),
        createPlayerStep(request, tournamentId),
        Effect.match({
          onFailure: (error) => reply.status(error.statusCode).send({ error: error.message }),
          onSuccess: (player) => {
            request.log.info({ playerId: player.id, pokemonName: player.name, tournamentId }, 'Player added to tournament')
            const response: PlayerResponse = {
              id: player.id,
              name: player.name,
              tournamentId: player.tournamentId
            }
            return reply.status(201).send(response)
          }
        })
      )
    )
  })

  fastify.get<{ Params: { tournamentId: string }, Reply: Player[] | { error: string } }>('/tournaments/:tournamentId/players', async (request, reply) => {
    const { tournamentId } = request.params

    return pipe(
      getTournament(tournamentId),
      Option.match({
        onNone: () => reply.status(404).send({ error: 'Tournament not found' }),
        onSome: () => reply.status(200).send(getPlayersByTournament(tournamentId))
      })
    )
  })

  fastify.get<{ Params: { playerId: string }, Reply: Player | { error: string } }>('/players/:playerId', async (request, reply) => {
    const { playerId } = request.params

    return pipe(
      getPlayer(playerId),
      Option.match({
        onNone: () => reply.status(404).send({ error: 'Player not found' }),
        onSome: (player) => reply.status(200).send(player)
      })
    )
  })

  fastify.get<{ Reply: Player[] }>('/players', async (_request, reply) => {
    return reply.status(200).send(getAllPlayers())
  })
}
