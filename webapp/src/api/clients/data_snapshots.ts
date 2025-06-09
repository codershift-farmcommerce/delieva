import { DataSnapshotEndpoints } from 'interface/endpoints/data_snapshot'
import { sendRequest } from 'webapp//api/request'
import { DataSnapshotGetInJSONFormatRQ } from 'interface/requests/data_snapshot'
import { DataSnapshotGetInJSONFormatRS } from 'interface/responses/data_snapshot'

export class DataSnapshotClient implements DataSnapshotEndpoints {
  path(): 'data_snapshot' {
    return 'data_snapshot'
  }

  async getInJsonFormat(
    req: DataSnapshotGetInJSONFormatRQ,
  ): Promise<DataSnapshotGetInJSONFormatRS> {
    return sendRequest('/data_snapshot/getInJsonFormat', req)
  }
}
