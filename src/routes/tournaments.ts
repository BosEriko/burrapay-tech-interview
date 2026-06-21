import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { CreateTournamentRequest, TournamentResponse } from '../types/index.ts'
import { createTournament } from '../storage/index.ts'

export async function tournamentRoutes(fastify: FastifyInstance) {
  
  // TODO: Implement POST /tournaments endpoint using fp-ts patterns
  fastify.post<{ Body: CreateTournamentRequest }>('/tournaments', async (request, reply) => {
    const { name } = request.body ?? {}

    // TODO: Use createTournament() and handle Either result with pipe/E.fold
    reply.status(501).send({ error: 'Not implemented yet' })
  })
  
  // TODO: Implement GET /tournaments endpoint
  
}
