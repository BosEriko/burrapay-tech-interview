import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import { CreatePlayerRequest, PlayerResponse, PokemonApiResponse } from '../types/index.ts'
import { createPlayer, getTournament } from '../storage/index.ts'

// TODO: for interviewee: Implement player routes using fp-ts patterns
// CRITICAL REQUIREMENT: ONLY Pokemon can be added as players - reject all non-Pokemon names!

// TODO: Implement Pokemon API validation function using TaskEither
// const validatePokemon = (name: string): TE.TaskEither<string, PokemonApiResponse> => ...

export async function playerRoutes(fastify: FastifyInstance) {
  
  // TODO: Implement POST /tournaments/:tournamentId/players endpoint
  // REQUIREMENT: Only Pokemon names are allowed - validate using PokeAPI
  
  fastify.post<{ Params: { tournamentId: string }, Body: CreatePlayerRequest }>('/tournaments/:tournamentId/players', async (request, reply) => {
    const { tournamentId } = request.params
    const { name } = request.body ?? {}

    if (typeof name !== 'string') {
      return reply.status(400).send({ error: 'Name is required' })
    }

    // TODO: Implement Pokemon validation and player creation logic
    
    reply.status(501).send({ error: 'Not implemented yet' })
    
    reply.status(501).send({ error: 'Not implemented yet' })
  })
  
}
