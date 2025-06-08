import { DataSnapshotEndpoints } from 'codershift-farmcommerce-api/endpoints/data_snapshot'
import { sendRequest } from 'src/api/request'
import { DataSnapshotGetInJSONFormatRQ } from 'codershift-farmcommerce-api/requests/data_snapshot'
import { DataSnapshotGetInJSONFormatRS } from 'codershift-farmcommerce-api/responses/data_snapshot'

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
