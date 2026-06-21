import { FastifyInstance } from 'fastify'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import { CreateTournamentRequest, TournamentResponse } from '../types/index.ts'
import { createTournament, storage } from '../storage/index.ts'

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
        (tournament) => {
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
    const tournaments = Array.from(storage.tournaments.values()).map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      createdAt: tournament.createdAt.toISOString()
    }))
    return reply.status(200).send(tournaments)
  })
}
