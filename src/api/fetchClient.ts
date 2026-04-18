import { API_BASE_URL, TOKEN_KEY } from './config';

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export const fetchClient = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const { data, headers: customHeaders, ...restOptions } = options;

  const token = localStorage.getItem(TOKEN_KEY);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config: RequestInit = {
    ...restOptions,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  let responseData;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    // Nếu lỗi 401 Unauthorized, ở đây mình có thể setup logout logic hoặc bắn event
    if (response.status === 401) {
      console.error('Unauthorized! Token expired or invalid.');
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('openAuthModal')); // Mở popup đăng nhập
    }

    const error = new Error((responseData as Record<string, unknown>)?.message as string || 'Có lỗi xảy ra khi gọi API');
    (error as unknown as Record<string, unknown>).status = response.status;
    (error as unknown as Record<string, unknown>).data = responseData;
    throw error;
  }

  return responseData;
};
