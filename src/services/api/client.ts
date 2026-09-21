const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://bible-desktop.com/api'
export const apiBaseUrl = configuredBaseUrl.replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiRequestOptions extends RequestInit {
  unwrap?: boolean
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: 'omit',
    headers,
  })
  const payload: unknown = await response.json().catch(() => undefined)
  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.message === 'string'
      ? payload.message
      : `Bible Desktop API returned HTTP ${response.status}`
    throw new ApiError(message, response.status, payload)
  }

  if (options.unwrap === false) return payload as T
  if (!isRecord(payload) || !('data' in payload)) throw new ApiError('Unexpected API response.', response.status, payload)
  return payload.data as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
