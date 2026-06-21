import { FastifyInstance } from 'fastify'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { CreateTournamentRequest, TournamentResponse } from '../types/index.ts'
import { createTournament, getTournament, getAllTournaments } from '../storage/index.ts'

export async function tournamentRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateTournamentRequest, Reply: TournamentResponse | { error: string } }>('/tournaments', async (request, reply) => {
    const { name } = request.body ?? {}

    if (typeof name !== 'string') {
      const message = 'Name is required'
      request.log.warn({ body: request.body }, message)
      return reply.status(400).send({ error: message })
    }

    return pipe(
      createTournament(name),
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
      createdAt: tournament.createdAt.toISOString()
    }))
    return reply.status(200).send(tournaments)
  })

  fastify.get<{ Params: { id: string }, Reply: TournamentResponse | { error: string } }>('/tournaments/:id', async (request, reply) => {
    const { id } = request.params

    return pipe(
      getTournament(id),
      O.fold(
        () => {
          request.log.warn({ tournamentId: id }, 'Tournament not found')
          return reply.status(404).send({ error: 'Tournament not found' })
        },
        (tournament) => {
          request.log.info({ tournamentId: id }, 'Tournament retrieved')
          return reply.status(200).send({
            id: tournament.id,
            name: tournament.name,
            createdAt: tournament.createdAt.toISOString()
          })
        }
      )
    )
  })
}
