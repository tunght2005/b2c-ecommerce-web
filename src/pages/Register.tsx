import Seo from '../components/Seo'

export default function Register() {
  return (
    <div className='flex items-center justify-center h-screen'>
      <Seo
        title='Đăng ký'
        description='Tạo tài khoản 7Store để mua sắm, nhận ưu đãi và quản lý đơn hàng dễ dàng.'
        keywords='đăng ký, 7Store, tạo tài khoản'
        canonicalPath='/register'
      />
      <div className='bg-white p-6 rounded-xl shadow w-[350px]'>
        <h2 className='text-xl font-bold mb-4'>Đăng ký</h2>
        <input placeholder='Email' className='w-full border p-2 mb-3' />
        <input placeholder='Mật khẩu' type='password' className='w-full border p-2 mb-3' />
        <button className='w-full bg-red-500 text-white py-2 rounded'>Đăng ký</button>
      </div>
    </div>
  )
}
