import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { PlayerError } from '../../../types'
import { fetchPokemon } from '../../../services/pokemon'
import { FastifyRequest } from 'fastify'

const badRequest = (message: string): PlayerError => ({ statusCode: 400, message })

export const fetchPokemonStep = (request: FastifyRequest) =>
  TE.chain((name: string) =>
    pipe(
      fetchPokemon(name),
      TE.mapLeft((error): PlayerError => {
        request.log.warn({ pokemonName: name, error }, 'Pokemon validation failed')
        return badRequest(error)
      }),
      TE.map((pokemonData) => {
        request.log.info({ pokemonName: name, pokemonId: pokemonData.id }, 'Pokemon validated')
        return { name, pokemonData }
      })
    )
  )
