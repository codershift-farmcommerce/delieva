import { AddNoteRequest } from '../entities/note'
import { AddRS } from '../responses/common'

export interface NoteEndpoints {
  path(): 'note'

  addNote(req: AddNoteRequest): Promise<AddRS>
}
