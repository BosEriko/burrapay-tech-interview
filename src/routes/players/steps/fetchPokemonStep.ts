import { Effect, pipe } from "effect"
import { PlayerError } from '../../../types'
import { fetchPokemon } from '../../../services/pokemon'
import { FastifyRequest } from 'fastify'

const badRequest = (message: string): PlayerError => ({ statusCode: 400, message })

export const fetchPokemonStep = (request: FastifyRequest) =>
  Effect.flatMap((name: string) =>
    pipe(
      fetchPokemon(name),
      Effect.mapError((error): PlayerError => {
        request.log.warn({ pokemonName: name, error }, 'Pokemon validation failed')
        return badRequest(error)
      }),
      Effect.map((pokemonData) => {
        request.log.info({ pokemonName: name, pokemonId: pokemonData.id }, 'Pokemon validated')
        return { name, pokemonData }
      })
    )
  )
