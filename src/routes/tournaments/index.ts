import { FastifyInstance } from 'fastify'
import { pipe, Option } from "effect"
import * as E from 'fp-ts/lib/Either'
import { TournamentResponse } from '../../types'
import { getTournament, getAllTournaments } from '../../storage'
import { CreateTournamentValidation } from '../../validation'
import { validationStep } from './steps/validationStep'
import { createTournamentStep } from './steps/createTournamentStep'

export async function tournamentRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: { name: string, isMega: boolean }, Reply: TournamentResponse | { error: string } }>('/tournaments', async (request, reply) => {
    const decoded = CreateTournamentValidation.decode(request.body)

    return pipe(
      decoded,
      validationStep(request),
      createTournamentStep,
      E.fold(
        (error) => {
          request.log.error({ error }, 'Failed to create tournament')
          return reply.status(400).send({ error })
        },
        (tournament) => {
          request.log.info({ tournamentId: tournament.id, name: tournament.name }, 'Tournament created')
          const response: TournamentResponse = {
            id: tournament.id,
            name: tournament.name,
            isMega: tournament.isMega,
            createdAt: tournament.createdAt.toISOString()
          }
          return reply.status(201).send(response)
        }
      )
    )
  })

  fastify.get<{ Reply: TournamentResponse[] }>('/tournaments', async (_request, reply) => {
    const tournaments = getAllTournaments().map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      isMega: tournament.isMega,
      createdAt: tournament.createdAt.toISOString()
    }))
    return reply.status(200).send(tournaments)
  })

  fastify.get<{ Params: { id: string }, Reply: TournamentResponse | { error: string } }>('/tournaments/:id', async (request, reply) => {
    const { id } = request.params

    return pipe(
      getTournament(id),
      Option.match({
        onNone: () => {
          request.log.warn({ tournamentId: id }, 'Tournament not found')
          return reply.status(404).send({ error: 'Tournament not found' })
        },
        onSome: (tournament) => {
          request.log.info({ tournamentId: id }, 'Tournament retrieved')
          return reply.status(200).send({
            id: tournament.id,
            name: tournament.name,
            isMega: tournament.isMega,
            createdAt: tournament.createdAt.toISOString()
          })
        }
      })
    )
  })
}
