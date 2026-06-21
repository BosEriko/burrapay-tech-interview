import * as t from 'io-ts'

export const CreateTournamentValidation = t.type({
  name: t.string
})

export const CreatePlayerValidation = t.type({
  name: t.string
})

export const formatValidationErrors = (errors: t.Errors): string => {
  for (const error of errors) {
    const last = error.context[error.context.length - 1]
    if (last.key === 'name' && error.value === undefined) {
      return 'Name is required'
    }
  }
  return 'Invalid request body'
}
