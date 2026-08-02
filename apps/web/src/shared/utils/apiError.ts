import axios from 'axios'

import type { ApiErrorPayload } from '@/shared/types/api.types'

const fallbackMessage = 'Something went wrong. Please try again.'

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return error instanceof Error && error.message ? error.message : fallbackMessage
  }

  return error.response?.data?.message || error.message || fallbackMessage
}

export function isRequestCancelled(error: unknown): boolean {
  return axios.isCancel(error) || (error instanceof DOMException && error.name === 'AbortError')
}
