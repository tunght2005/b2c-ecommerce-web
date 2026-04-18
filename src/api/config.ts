export const API_BASE_URL = 'https://b2c-ecommerce-api.onrender.com/api'
export const UPLOADS_BASE_URL = 'https://b2c-ecommerce-api.onrender.com'

export const TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'
export const USER_INFO_KEY = 'userInfo'

// Hàm tiện ích: Tự động gán domain vào đường dẫn ảnh tương đối từ Server
export const resolveImageUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${UPLOADS_BASE_URL}${url}`
  return url
}
