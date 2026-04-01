import { ChevronUp } from 'lucide-react'

type ScrollTopProps = {
  show: boolean
}

export default function ScrollTop({ show }: ScrollTopProps) {
  if (!show) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className='fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition'
    >
      <ChevronUp size={20} />
    </button>
  )
}
