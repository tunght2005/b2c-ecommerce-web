import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from './config'

interface FetchOptions extends RequestInit {
  data?: unknown
}

let refreshTokenPromise: Promise<string | null> | null = null

const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
  window.dispatchEvent(new Event('authChange'))
}

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return await response.json()
  }
  return await response.text()
}

const shouldSkipRefresh = (endpoint: string) => {
  return (
    endpoint.includes('/auth/login') || endpoint.includes('/auth/register') || endpoint.includes('/auth/refresh-token')
  )
}

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshTokenPromise) return refreshTokenPromise

  refreshTokenPromise = (async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) return null

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      const responseData = await parseResponseBody(response)
      if (!response.ok) {
        return null
      }

      const nextToken =
        (responseData as Record<string, unknown>)?.accessToken ||
        ((responseData as Record<string, unknown>)?.data as Record<string, unknown> | undefined)?.accessToken

      if (typeof nextToken === 'string' && nextToken) {
        localStorage.setItem(TOKEN_KEY, nextToken)
        window.dispatchEvent(new Event('authChange'))
        return nextToken
      }

      return null
    } catch {
      return null
    }
  })()

  try {
    return await refreshTokenPromise
  } finally {
    refreshTokenPromise = null
  }
}

const requestWithToken = async (endpoint: string, options: FetchOptions, tokenOverride?: string | null) => {
  const { data, headers: customHeaders, ...restOptions } = options
  const token = tokenOverride ?? localStorage.getItem(TOKEN_KEY)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders
  }

  const config: RequestInit = {
    ...restOptions,
    headers
  }

  if (data !== undefined) {
    config.body = JSON.stringify(data)
  }

  return fetch(`${API_BASE_URL}${endpoint}`, config)
}

export const fetchClient = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  let response = await requestWithToken(endpoint, options)

  if (response.status === 401 && !shouldSkipRefresh(endpoint)) {
    const nextAccessToken = await refreshAccessToken()

    if (nextAccessToken) {
      response = await requestWithToken(endpoint, options, nextAccessToken)
    } else {
      clearAuthSession()
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { view: 'login' } }))
    }
  }

  const responseData = await parseResponseBody(response)

  if (!response.ok) {
    if (response.status === 401) {
      if (!shouldSkipRefresh(endpoint)) {
        clearAuthSession()
        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { view: 'login' } }))
      }
    }

    const error = new Error(
      ((responseData as Record<string, unknown>)?.message as string) || 'Có lỗi xảy ra khi gọi API'
    )
    ;(error as unknown as Record<string, unknown>).status = response.status
    ;(error as unknown as Record<string, unknown>).data = responseData
    throw error
  }

  return responseData
}
