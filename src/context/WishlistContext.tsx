import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchClient } from '../api/fetchClient'
import { TOKEN_KEY } from '../api/config'

interface WishlistContextType {
  wishlistIds: string[]
  wishlistCount: number
  loading: boolean
  toggleWishlist: (productId: string) => Promise<boolean> // Returns true if added, false if removed
  isInWishlist: (productId: string) => boolean
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const refreshWishlist = async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setWishlistIds([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res: any = await fetchClient('/wishlist')
      const data = res?.data || res || []
      const items = Array.isArray(data) ? data : data.items || []
      const ids = items
        .map((item: any) => (typeof item.product_id === 'string' ? item.product_id : item.product_id?._id))
        .filter(Boolean)

      setWishlistIds(ids)
    } catch (err) {
      console.error('Lỗi khi tải Wishlist:', err)
      setWishlistIds([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshWishlist()

    const handleAuthChange = () => refreshWishlist()
    window.addEventListener('authChange', handleAuthChange)
    return () => window.removeEventListener('authChange', handleAuthChange)
  }, [])

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      // Trigger modal login
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { view: 'login' } }))
      throw new Error('Vui lòng đăng nhập!')
    }

    const isCurrentlyLiked = wishlistIds.includes(productId)

    // Optimistic update
    setWishlistIds((prev) => (isCurrentlyLiked ? prev.filter((id) => id !== productId) : [...prev, productId]))

    try {
      if (isCurrentlyLiked) {
        await fetchClient(`/wishlist/product/${productId}`, { method: 'DELETE' })
        return false
      } else {
        await fetchClient('/wishlist', {
          method: 'POST',
          body: JSON.stringify({ product_id: productId })
        })
        return true
      }
    } catch (err: any) {
      // Rollback
      refreshWishlist()
      alert(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
      throw err
    }
  }

  const isInWishlist = (productId: string) => wishlistIds.includes(productId)

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
