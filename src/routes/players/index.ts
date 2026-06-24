import { FastifyInstance } from 'fastify'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import * as O from 'fp-ts/lib/Option'
import { Player, PlayerResponse } from '../../types'
import { getTournament, getPlayer, getAllPlayers, getPlayersByTournament } from '../../storage'
import { CreatePlayerValidation } from '../../validation'
import { validationStep } from './steps/validationStep'
import { checkTournamentStep } from './steps/checkTournamentStep'
import { checkMegaStep } from './steps/checkMegaStep'
import { fetchPokemonStep } from './steps/fetchPokemonStep'
import { createPlayerStep } from './steps/createPlayerStep'

export async function playerRoutes(fastify: FastifyInstance) {
  fastify.post<{ Params: { tournamentId: string }, Body: { name: string }, Reply: PlayerResponse | { error: string } }>('/tournaments/:tournamentId/players', async (request, reply) => {
    const { tournamentId } = request.params
    const decoded = CreatePlayerValidation.decode(request.body)

    return await pipe(
      decoded,
      validationStep(request),
      TE.fromEither,
      checkTournamentStep(request, tournamentId),
      checkMegaStep(request),
      fetchPokemonStep(request),
      createPlayerStep(request, tournamentId),
      TE.fold(
        (error) => reply.status(error.statusCode).send({ error: error.message }),
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
    )()
  })

  fastify.get<{ Params: { tournamentId: string }, Reply: Player[] | { error: string } }>('/tournaments/:tournamentId/players', async (request, reply) => {
    const { tournamentId } = request.params

    return pipe(
      getTournament(tournamentId),
      O.fold(
        () => reply.status(404).send({ error: 'Tournament not found' }),
        () => reply.status(200).send(getPlayersByTournament(tournamentId))
      )
    )
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
