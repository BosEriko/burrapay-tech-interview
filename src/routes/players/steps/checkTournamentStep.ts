import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from "effect"
import { PlayerError, Tournament } from '../../../types'
import { getTournament } from '../../../storage'
import { FastifyRequest } from 'fastify'

const notFound = (message: string): PlayerError => ({ statusCode: 404, message })

export const checkTournamentStep = (request: FastifyRequest, tournamentId: string) =>
  TE.chain((context: { name: string }) =>
    pipe(
      getTournament(tournamentId),
      E.fromOption((): PlayerError => {
        request.log.warn({ tournamentId }, 'Tournament not found')
        return notFound('Tournament not found')
      }),
      E.map((tournament: Tournament) => ({ name: context.name, tournament })),
      TE.fromEither
    )
  )
