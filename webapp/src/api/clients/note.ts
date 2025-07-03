import { NoteEndpoints } from 'interface/endpoints/note'
import { AddNoteRequest } from 'interface/entities/note'
import { sendRequest } from '../request'
import { AddRS } from 'interface/responses/common'

export class NoteClient implements NoteEndpoints {
  path(): 'note' {
    return 'note'
  }
  async addNote(request: AddNoteRequest): Promise<AddRS> {
    return sendRequest('/note/addNote', request)
  }
}
