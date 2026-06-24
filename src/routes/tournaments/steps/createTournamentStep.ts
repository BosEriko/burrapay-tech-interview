import * as E from 'fp-ts/lib/Either'
import { createTournament } from '../../../storage'

export const createTournamentStep = E.chain(
  ({ name, isMega }: { name: string; isMega: boolean }) => createTournament(name, isMega)
)
