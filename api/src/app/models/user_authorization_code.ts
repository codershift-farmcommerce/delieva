import * as bcrypt from 'bcrypt'
import { AuthGenerateAuthorizationCodeRQ } from 'lib/requests/auth'
import { AuthGenerateAuthorizationCodeRS } from 'lib/responses/auth'
import knex from 'knex'
import { Ctx } from 'src/app/context'

export async function generateAuthorizationCode(
  ctx: Ctx,
  req: AuthGenerateAuthorizationCodeRQ,
): Promise<AuthGenerateAuthorizationCodeRS> {
  const userId = ctx.session.user_id
  const codeForDB = makeAuthorizationCode(4)
  const code = `${userId}.${codeForDB}`

  const result = await ctx
    .knex('user_authorization_code')
    .select('id')
    .where({
      user_id: userId,
    })
    .first()

  const encryptedCodeForDB = await bcrypt.hash(codeForDB, 12)

  if (result) {
    const { id } = result
    await ctx
      .knex('user_authorization_code')
      .update({
        code: encryptedCodeForDB,
      })
      .where({
        id,
      })
  } else {
    await ctx.knex('user_authorization_code').insert({
      user_id: userId,
      code: encryptedCodeForDB,
    })
  }

  return {
    code,
  }
}

export async function getUserEmailByAuthorizationCodeAndRemoveCode(
  ctx: Ctx,
  codeFromRequest: string,
): Promise<string | null> {
  const [userId, codeForDB] = codeFromRequest.split('.')
  let userEmail: string | null = null

  await ctx.knex.transaction(async trx => {
    const result = await trx('user_authorization_code')
      .select('id', 'user_id', 'code', 'expiring_at')
      .where({
        user_id: userId,
      })
      .first()

    const isCorrectCode = await bcrypt.compare(
      codeForDB,
      result.code.replace('$2y$', '$2a$'),
    )
    if (isCorrectCode) {
      const userFromDB = await trx('users')
        .select('email')
        .where({
          id: result.user_id,
        })
        .first()

      userEmail = userFromDB.email

      await trx('user_authorization_code')
        .where({
          id: result.id,
        })
        .update({
          code: null,
        })
    }
  })

  return userEmail
}

function makeAuthorizationCode(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
