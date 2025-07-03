export interface Note {
  id: number
  entity_type: string
  entity_id: number
  value: string
  created_at: string
  updated_at: string
}

export enum NoteEntityType {
  PURCHASE_ORDER = 'purchase_order',
}

export interface AddNoteRequest {
  entity_type: NoteEntityType
  entity_id: number
  value: string
}

export interface AddNoteResponse {
  note: Note
}
