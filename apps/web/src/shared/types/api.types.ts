export interface ApiErrorPayload {
  code: string
  message: string
  fieldErrors?: Record<string, string>
  timestamp?: string
  path?: string
}

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  total?: number
}

export interface Page<T> {
  items: T[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}
