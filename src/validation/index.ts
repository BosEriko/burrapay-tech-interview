import * as Schema from "effect/Schema"
import { Either as EffectEither } from "effect"
import * as E from 'fp-ts/lib/Either'

export const CreateTournamentValidation = Schema.Struct({
  name: Schema.String,
  isMega: Schema.optional(Schema.Boolean)
})

export const CreatePlayerValidation = Schema.Struct({
  name: Schema.String
})

export const decode = <A>(schema: Schema.Schema<A>) =>
  (input: unknown): E.Either<string, A> => {
    const result = Schema.decodeUnknownEither(schema)(input)
    return EffectEither.match(result, {
      onLeft: (parseError) => E.left(String(parseError)),
      onRight: (value) => E.right(value)
    })
  }
