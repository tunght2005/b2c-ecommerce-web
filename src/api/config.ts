export const API_BASE_URL = 'https://b2c-ecommerce-api.onrender.com/api'
export const UPLOADS_BASE_URL = 'https://b2c-ecommerce-api.onrender.com'

export const TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'
export const USER_INFO_KEY = 'userInfo'

// Hàm tiện ích: Tự động gán domain vào đường dẫn ảnh tương đối từ Server
export const resolveImageUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined
  if (url.startsWith('data:')) return url

  const normalized = url.replace(/\\/g, '/')

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  if (normalized.startsWith('/')) return encodeURI(`${UPLOADS_BASE_URL}${normalized}`)

  // Trường hợp backend trả về dạng "uploads/file.webp" hoặc "images/file.webp"
  return encodeURI(`${UPLOADS_BASE_URL}/${normalized.replace(/^\.?\/*/, '')}`)
}
