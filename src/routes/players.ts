import { FastifyInstance } from 'fastify'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import { CreatePlayerRequest, PlayerResponse, PokemonApiResponse } from '../types/index.ts'
import { createPlayer, getTournament } from '../storage/index.ts'

const validatePokemon = (name: string): TE.TaskEither<string, PokemonApiResponse> => TE.tryCatch(
  () => fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`).then(res => {
    if (!res.ok) throw new Error('Not found')
    return res.json() as Promise<PokemonApiResponse>
  }),
  (error) => `Name is not a valid Pokemon: ${error}`
)

export async function playerRoutes(fastify: FastifyInstance) {
  fastify.post<{ Params: { tournamentId: string }, Body: CreatePlayerRequest }>('/tournaments/:tournamentId/players', async (request, reply) => {
    const { tournamentId } = request.params
    const { name } = request.body ?? {}

    if (typeof name !== 'string') {
      return reply.status(400).send({ error: 'Name is required' })
    }

    const tournament = getTournament(tournamentId)
    if (O.isNone(tournament)) {
      return reply.status(404).send({ error: 'Tournament not found' })
    }

    const handlePlayerData = (pokemonData: PokemonApiResponse) => {
      const playerResult = createPlayer(name, tournamentId, {
        id: pokemonData.id,
        types: pokemonData.types.map(t => t.type.name),
        height: pokemonData.height,
        weight: pokemonData.weight
      })

      return pipe(
        playerResult,
        E.fold(
          (error) => reply.status(400).send({ error }),
          (player) => {
            const response: PlayerResponse = {
              id: player.id,
              name: player.name,
              tournamentId: player.tournamentId
            }
            return reply.status(201).send(response)
          }
        )
      )
    }

    return pipe(
      await validatePokemon(name)(),
      E.fold(
        (error) => reply.status(400).send({ error }),
        handlePlayerData
      )
    )
  })
}
