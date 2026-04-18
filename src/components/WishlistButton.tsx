import React, { useState } from 'react';
import { Heart, Loader } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function WishlistButton({ 
  productId, 
  className = '', 
  size = 20,
  showText = false
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);
  const isLiked = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    try {
      await toggleWishlist(productId);
    } catch (err) {
      // Error is handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`group flex items-center justify-center gap-2 transition hover:scale-110 active:scale-90 ${className}`}
      title={isLiked ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
    >
      {loading ? (
        <Loader size={size} className="animate-spin text-gray-400" />
      ) : (
        <Heart 
          size={size} 
          className={`transition-colors duration-300 ${
            isLiked 
              ? 'text-red-500 fill-red-500 shadow-red-200' 
              : 'text-gray-400 group-hover:text-red-500'
          }`} 
        />
      )}
      {showText && (
        <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-600 group-hover:text-red-500'}`}>
          {isLiked ? 'Đã yêu thích' : 'Yêu thích'}
        </span>
      )}
    </button>
  );
}
