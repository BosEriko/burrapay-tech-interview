import * as Schema from "effect/Schema"
import { Either, pipe } from "effect"

export const CreateTournamentValidation = Schema.Struct({
  name: Schema.String,
  isMega: Schema.optional(Schema.Boolean)
})

export const CreatePlayerValidation = Schema.Struct({
  name: Schema.String
})

const formatIssueMessage = (issue: any, path?: string): string => {
  if (!issue || typeof issue !== 'object') return ''
  switch (issue._tag) {
    case 'Composite':
      if (Array.isArray(issue.issues)) {
        return issue.issues.map((i: any) => formatIssueMessage(i)).join('; ')
      }
      return issue.issues ? formatIssueMessage(issue.issues) : ''
    case 'Pointer':
      return formatIssueMessage(issue.issue, issue.path)
    case 'Type':
      return (path ? path + ': ' : '') + 'Expected ' + (issue.ast?.annotations?.[Symbol.for('effect/annotation/Title')] || 'value') + ', actual ' + JSON.stringify(issue.actual)
    case 'Missing':
      return (path ? path + ': ' : '') + 'is missing'
    default:
      return (path ? path + ': ' : '') + String(issue)
  }
}

const formatError = (error: unknown): string => {
  if (error && typeof error === 'object' && '_tag' in (error as any)) {
    return formatIssueMessage((error as any).issue || error)
  }
  return String(error)
}

export const decode = <A>(schema: Schema.Schema<A>) =>
(input: unknown): Either.Either<A, string> =>
    pipe(
      Schema.decodeUnknownEither(schema)(input),
      Either.mapLeft(formatError)
    )
