import { useState } from 'react'
import { Search, ShoppingCart, User } from 'lucide-react'

function Header() {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  // fake data 
  const fakeData = [
    'iPhone 15 Pro Max',
    'iPhone 14 Pro',
    'Samsung S25 Ultra',
    'MacBook Air M3',
    'Apple Watch Series 9',
    'Tai nghe AirPods Pro',
  ]

  const handleSearch = (value: string) => {
    setKeyword(value)

    if (!value.trim()) {
      setSuggestions([])
      return
    }

    const result = fakeData.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    )

    setSuggestions(result)
  }

  return (
    <header className='bg-red-600 text-white shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4'>
        
        {/* LOGO */}
        <h1
          onClick={() => (window.location.href = '/')}
          className='text-3xl font-bold cursor-pointer hover:text-yellow-300 transition'
        >
          SevenStore
        </h1>

        {/* SEARCH */}
        <div className='flex-1 flex justify-center relative'>
          <div className='relative w-full max-w-[500px]'>
            
            {/* ICON */}
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              size={18}
            />

            {/* INPUT */}
            <input
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Tìm kiếm điện thoại, laptop...'
              className='w-full pl-10 pr-4 py-2 rounded-xl text-black outline-none'
            />

            {/* AUTOCOMPLETE */}
            {suggestions.length > 0 && (
              <div className='absolute top-full left-0 w-full bg-white text-black rounded-xl shadow-lg mt-2 z-50 overflow-hidden'>
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setKeyword(item)
                      setSuggestions([])
                    }}
                    className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ACTION */}
        <div className='flex items-center gap-6 font-medium'>
          
          {/* LOGIN */}
          <button className='flex items-center gap-2 hover:text-yellow-300 transition'>
            <User size={18} />
            Đăng nhập
          </button>

          {/* REGISTER */}
          <button className='flex items-center gap-2 hover:text-yellow-300 transition'>
            <User size={18} />
            Đăng ký
          </button>

          {/* CART */}
          <button className='relative flex items-center gap-2 hover:text-yellow-300 transition'>
            <ShoppingCart size={20} />
            Giỏ hàng

            {/* BADGE */}
            <span className='absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full'>
              0
            </span>
          </button>
        </div>

      </div>
    </header>
  )
}

export default Header