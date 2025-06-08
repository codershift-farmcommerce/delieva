import { Knex } from 'knex'

type ForeignKey = {
  conrelid: string
  fk_name: string
  def: string
}
async function withoutForeignKeys(
  knex: Knex,
  tableName: string,
  closure: (knex: Knex) => Promise<any>,
  validateConstraint?: false,
) {
  await knex.raw('BEGIN')
  const foreignKeys: Array<ForeignKey> = (
    await knex.raw(`
      SELECT 
        confrelid::regclass, 
        af.attname as fcol,
        conrelid::regclass, 
        a.attname as col,
        pg_catalog.pg_get_constraintdef(oid) as def,
        conname as fk_name
      FROM pg_attribute af, pg_attribute a,
        (SELECT 
           conrelid,
           confrelid,
           conkey[i] as conkey, 
           confkey[i] as confkey, 
           oid, 
           conname
         FROM (
           SELECT 
             conrelid,
             confrelid,
             conkey,
             confkey,
             oid,
             conname,
             GENERATE_SERIES(1, ARRAY_UPPER(conkey,1)) as i
           FROM pg_constraint 
           WHERE contype = 'f') ss) ss2
    WHERE 
        af.attnum = confkey 
    AND af.attrelid = confrelid 
    AND a.attnum = conkey 
    AND a.attrelid = conrelid
    AND confrelid::regclass = '${tableName}'::regclass`)
  ).rows
  await knex.raw(`SET LOCAL work_mem = '256MB'`)
  for await (const k of foreignKeys) {
    await knex.raw(`ALTER TABLE ${k.conrelid} DROP CONSTRAINT "${k.fk_name}"`)
  }
  await closure(knex)
  for await (const k of foreignKeys) {
    await knex.raw(
      `ALTER TABLE ${k.conrelid} ADD CONSTRAINT "${k.fk_name}" ${k.def} NOT VALID`,
    )
  }
  if (validateConstraint) {
    for await (const k of foreignKeys) {
      await knex.raw(
        `ALTER TABLE ${k.conrelid} VALIDATE CONSTRAINT "${k.fk_name}"`,
      )
    }
  }

  await knex.raw('COMMIT')
}

export default withoutForeignKeys
