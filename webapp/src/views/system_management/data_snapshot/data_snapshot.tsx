import styles from './data_snapshot.module.css'
import ViewContainer from 'src/components/views/container/container'
import ViewHeader from 'src/components/views/header/header'
import { DataSnapshotClient } from 'src/api/clients/data_snapshots'
import { downloadFile } from 'src/components/functions/files'

const dataSnapshotClient = new DataSnapshotClient()

const DataSnapshot = () => {
  const getJSONSnapshot = async () => {
    const data = (await dataSnapshotClient.getInJsonFormat({})) as unknown as Blob
    downloadFile(data, `snapshot_${new Date().toISOString()}.zip`)
  }

  return (
    <ViewContainer title={'Respaldo de Datos'}>
      <ViewHeader>
        <button className={styles.header_button} onClick={getJSONSnapshot}>
          Obtener respaldo en JSON
        </button>
      </ViewHeader>
    </ViewContainer>
  )
}

export default DataSnapshot
