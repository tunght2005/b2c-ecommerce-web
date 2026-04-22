import Header from '../components/Header'
import Navbar from '../components/Navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-100'>
      <Header />
      <Navbar />

      <main>{children}</main>

      <footer className='bg-gray-900 text-white mt-12 py-10'>
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='text-3xl font-bold cursor-pointer'>7Store</h3>
            <p className='text-gray-400 mt-3'>Website bán điện thoại, laptop và phụ kiện công nghệ.</p>
          </div>

          <div>
            <h3 className='text-2xl font-bold mb-4'>Danh mục</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>Điện thoại</li>
              <li>Laptop</li>
              <li>Tablet</li>
              <li>Phụ kiện</li>
            </ul>
          </div>

          <div>
            <h3 className='text-2xl font-bold mb-4'>Liên hệ</h3>
            <p className='text-gray-400'>Email: support@sevenstore.vn</p>
            <p className='text-gray-400'>Hotline: 0123 456 789</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
