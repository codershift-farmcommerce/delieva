import * as Bluebird from 'bluebird'
import { DataSnapshotEndpoints } from 'interface/endpoints/data_snapshot'
import { Ctx } from 'api/src/app/context'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'interface'
import { DataSnapshotGetInJSONFormatRQ } from 'interface/requests/data_snapshot'
import { DataSnapshotGetInJSONFormatRS } from 'interface/responses/data_snapshot'
import * as archiver from 'archiver'

export class DataSnapshotService implements DataSnapshotEndpoints {
  private ctx: Ctx

  path(): 'data_snapshot' {
    return 'data_snapshot'
  }

  @action({ forApp: Application.SYSTEM_MANAGEMENT })
  async getInJsonFormat(
    req: DataSnapshotGetInJSONFormatRQ,
  ): Promise<DataSnapshotGetInJSONFormatRS> {
    const tablesToOmit: string[] = []
    const { rows } = await this.ctx.knex.raw(`
        SELECT tablename FROM pg_tables WHERE schemaname='public';
    `)
    const tables = rows
      .map((row: any) => row.tablename)
      .filter((tableName: string) => !tablesToOmit.includes(tableName))

    this.ctx.res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-disposition': 'attachment; filename=snapshot.zip',
    })
    const zip = archiver('zip')
    zip.pipe(this.ctx.res)

    await Bluebird.each(tables, async (tableName: string, index: number) => {
      const { rows } = await this.ctx.knex.raw(`
        SELECT JSON_AGG(${tableName}) FROM ${tableName};
      `)
      const jsonRows = rows[0].json_agg ?? []
      zip.append(JSON.stringify(jsonRows, null, 2), {
        name: `${tableName}.json`,
      })
    })

    await zip.finalize()

    return {
      success: true,
    }
  }
}
