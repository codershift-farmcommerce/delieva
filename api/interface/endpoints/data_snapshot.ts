import { DataSnapshotGetInJSONFormatRQ } from '../requests/data_snapshot'
import { DataSnapshotGetInJSONFormatRS } from '../responses/data_snapshot'

export interface DataSnapshotEndpoints {
  path(): 'data_snapshot'

  getInJsonFormat(
    req: DataSnapshotGetInJSONFormatRQ,
  ): Promise<DataSnapshotGetInJSONFormatRS>
}
