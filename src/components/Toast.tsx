import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

// Hàm helper để trigger toast từ bất kỳ component nào
export const showToast = (message: string, type: ToastType = 'success') => {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }))
}

let toastCounter = 0

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail
      const id = ++toastCounter
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), 3000)
    }
    window.addEventListener('showToast', handler)
    return () => window.removeEventListener('showToast', handler)
  }, [removeToast])

  const icons = {
    success: <CheckCircle size={18} className='text-green-500 shrink-0' />,
    error: <XCircle size={18} className='text-red-500 shrink-0' />,
    info: <Info size={18} className='text-blue-500 shrink-0' />,
    warning: <Info size={18} className='text-yellow-500 shrink-0' />
  }

  const borders = {
    success: 'border-l-4 border-green-500',
    error: 'border-l-4 border-red-500',
    info: 'border-l-4 border-blue-500',
    warning: 'border-l-4 border-yellow-500'
  }

  return (
    <div className='fixed top-5 right-5 z-999 flex flex-col gap-2 pointer-events-none'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 bg-white shadow-xl rounded-xl px-4 py-3 min-w-65 max-w-85
            ${borders[toast.type]}
            animate-slide-in-right
          `}
        >
          {icons[toast.type]}
          <span className='text-sm font-medium text-gray-800 flex-1'>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className='text-gray-400 hover:text-gray-600 transition shrink-0'
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  )
}
