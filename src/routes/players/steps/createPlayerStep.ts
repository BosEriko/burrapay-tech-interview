import { Either, Effect, pipe } from "effect"
import { PlayerError, PokemonApiResponse } from '../../../types'
import { createPlayer } from '../../../storage'
import { FastifyRequest } from 'fastify'

const badRequest = (message: string): PlayerError => ({ statusCode: 400, message })

export const createPlayerStep = (request: FastifyRequest, tournamentId: string) =>
  Effect.flatMap(({ name, pokemonData }: { name: string; pokemonData: PokemonApiResponse }) =>
    pipe(
      createPlayer(name, tournamentId, {
        id: pokemonData.id,
        types: pokemonData.types.map(t => t.type.name),
        height: pokemonData.height,
        weight: pokemonData.weight
      }),
      Either.mapLeft((error): PlayerError => {
        request.log.error({ error }, 'Failed to create player')
        return badRequest(error)
      }),
      Either.match({
        onLeft: (e) => Effect.fail(e),
        onRight: (a) => Effect.succeed(a)
      })
    )
  )
