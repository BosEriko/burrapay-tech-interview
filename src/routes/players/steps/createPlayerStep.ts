import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { PlayerError, PokemonApiResponse } from '../../../types'
import { createPlayer } from '../../../storage'
import { FastifyRequest } from 'fastify'

const badRequest = (message: string): PlayerError => ({ statusCode: 400, message })

export const createPlayerStep = (request: FastifyRequest, tournamentId: string) =>
  TE.chain(({ name, pokemonData }: { name: string; pokemonData: PokemonApiResponse }) =>
    pipe(
      createPlayer(name, tournamentId, {
        id: pokemonData.id,
        types: pokemonData.types.map(t => t.type.name),
        height: pokemonData.height,
        weight: pokemonData.weight
      }),
      E.mapLeft((error): PlayerError => {
        request.log.error({ error }, 'Failed to create player')
        return badRequest(error)
      }),
      TE.fromEither
    )
  )
