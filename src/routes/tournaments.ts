import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { CreateTournamentRequest, TournamentResponse } from '../types/index.ts'
import { createTournament } from '../storage/index.ts'

export async function tournamentRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateTournamentRequest }>('/tournaments', async (request, reply) => {
    const { name } = request.body ?? {}

    if (typeof name !== 'string') {
      return reply.status(400).send({ error: 'Name is required' })
    }

    return pipe(
      createTournament(name),
      E.fold(
        (error) => reply.status(400).send({ error }),
        (success) => {
          return reply.status(201).send(success)
        }
      )
    )
  })
  
  // TODO: Implement GET /tournaments endpoint
}
