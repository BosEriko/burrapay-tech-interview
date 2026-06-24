import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { PlayerError } from '../../../types'
import { getTournament } from '../../../storage'
import { isMega } from '../../../services/pokemon'
import { FastifyRequest } from 'fastify'

const badRequest = (message: string): PlayerError => ({ statusCode: 400, message })
const notFound = (message: string): PlayerError => ({ statusCode: 404, message })

export const checkTournamentStep = (request: FastifyRequest, tournamentId: string) =>
  TE.chain(({ name }: { name: string }) =>
    pipe(
      getTournament(tournamentId),
      E.fromOption((): PlayerError => {
        request.log.warn({ tournamentId }, 'Tournament not found')
        return notFound('Tournament not found')
      }),
      E.chain((tournament): E.Either<PlayerError, string> => {
        if (tournament.isMega && !isMega(name.toLowerCase())) {
          request.log.warn({ tournamentId, name }, 'Pokemon must be a mega pokemon')
          return E.left(badRequest('Pokemon must be a mega pokemon'))
        }
        return E.right(name)
      }),
      TE.fromEither
    )
  )
