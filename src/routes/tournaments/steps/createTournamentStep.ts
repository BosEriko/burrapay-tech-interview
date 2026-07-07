import { Either } from 'effect'
import { createTournament } from '../../../storage'

export const createTournamentStep = Either.flatMap(
  ({ name, isMega }: { readonly name: string; readonly isMega?: boolean }) => createTournament(name, isMega ?? false)
  )
