export default function Login() {
  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='bg-white p-6 rounded-xl shadow w-[350px]'>
        <h2 className='text-xl font-bold mb-4'>Đăng nhập</h2>
        <input placeholder='Email' className='w-full border p-2 mb-3' />
        <input placeholder='Mật khẩu' type='password' className='w-full border p-2 mb-3' />
        <button className='w-full bg-red-500 text-white py-2 rounded'>Đăng nhập</button>
      </div>
    </div>
  )
}
