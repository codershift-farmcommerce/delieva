import { Ctx } from 'api/src/app/context'
import { NoteEndpoints } from 'interface/endpoints/note'
import { AddNoteRequest } from 'interface/entities/note'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'interface'
import * as note from 'api/src/app/models/note'
import { AddRS } from 'interface/responses/common'

export class NoteService implements NoteEndpoints {
  private ctx: Ctx

  path(): 'note' {
    return 'note'
  }

  @action({
    forApps: [
      Application.POS,
      Application.ADMIN,
      Application.SYSTEM_MANAGEMENT,
    ],
  })
  addNote(req: AddNoteRequest): Promise<AddRS> {
    return note.addNote(this.ctx, req)
  }
}
