import Header from '../components/Header'
import Navbar from '../components/Navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='min-h-screen theme-page'>
      <Header />
      <Navbar />

      <main className='text-slate-900 dark:text-slate-100'>{children}</main>

      <footer className='theme-footer mt-12 py-10'>
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='text-3xl font-bold cursor-pointer'>7Store</h3>
            <p className='mt-3 text-slate-300'>Website bán điện thoại, laptop và phụ kiện công nghệ.</p>
          </div>

          <div>
            <h3 className='text-2xl font-bold mb-4'>Danh mục</h3>
            <ul className='space-y-2 text-slate-300'>
              <li>Điện thoại</li>
              <li>Laptop</li>
              <li>Tablet</li>
              <li>Phụ kiện</li>
            </ul>
          </div>

          <div>
            <h3 className='text-2xl font-bold mb-4'>Liên hệ</h3>
            <p className='text-slate-300'>Email: support@sevenstore.vn</p>
            <p className='text-slate-300'>Hotline: 0123 456 789</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
