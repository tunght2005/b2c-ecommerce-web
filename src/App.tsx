import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { HelmetProvider as HelmetProviderBase } from 'react-helmet-async'
import { TOKEN_KEY } from './api/config'
import Header from './components/Header'
import Navbar from './components/Navbar'
import AIChat from './components/AIChat'
import Toast from './components/Toast'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import ReturnPolicy from './pages/ReturnPolicy'
import ReturnRequest from './pages/ReturnRequest'
import CancelSuccess from './pages/CancelSuccess'
import OrderSuccess from './pages/OrderSuccess'
import VnpayReturn from './pages/VnpayReturn'

import ProfileLayout from './components/ProfileLayout'
import ProfileInfo from './pages/ProfileInfo'
import ProfileAddresses from './pages/ProfileAddresses'
import ProfileNotifications from './pages/ProfileNotifications'
import ProfileFeedback from './pages/ProfileFeedback'
import ProfileReturns from './pages/ProfileReturns'
import ProfileReviews from './pages/ProfileReviews'
import ProfileWishlist from './pages/ProfileWishlist'
import ProfileWarranty from './pages/ProfileWarranty'
import ProfilePromotions from './pages/ProfilePromotions'

const path = {
  login: '/login',
  dashboard: '/'
}

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(Boolean(localStorage.getItem(TOKEN_KEY)))
    }

    window.addEventListener('authChange', syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('authChange', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  return { isAuthenticated }
}

//Tạo Protect để bảo vệ web khi user biêt domain mà chưa đăng nhập thì những cái như profile, apply k cho phép truy cập
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to={path.login} replace />
}

// Chặn User vào lại trang login khi đã login rồi sẽ Navigate lại trang chủ
function RejectedRoute() {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <Outlet /> : <Navigate to={path.dashboard} replace />
}

function App() {
  const HelmetProvider = HelmetProviderBase as unknown as any

  return (
    <HelmetProvider>
      <Header />
      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/product/:id' element={<ProductDetail />} />
        <Route path='/category/:name' element={<CategoryPage />} />

        <Route element={<RejectedRoute />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Route>

        {/* PROFILE NESTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path='/profile' element={<ProfileLayout />}>
            <Route index element={<ProfileInfo />} />
            <Route path='orders' element={<Orders />} />
            <Route path='addresses' element={<ProfileAddresses />} />
            <Route path='notifications' element={<ProfileNotifications />} />
            <Route path='feedback' element={<ProfileFeedback />} />
            <Route path='returns' element={<ProfileReturns />} />
            <Route path='reviews' element={<ProfileReviews />} />
            <Route path='wishlist' element={<ProfileWishlist />} />
            <Route path='warranty' element={<ProfileWarranty />} />
            <Route path='promotions' element={<ProfilePromotions />} />
          </Route>

          {/* ORDER DETAILS & ACTIONS (Full Screen) */}
          <Route path='/orders/:id' element={<OrderDetail />} />
          <Route path='/orders/:id/return' element={<ReturnRequest />} />
          <Route path='/orders/:id/cancel-success' element={<CancelSuccess />} />
        </Route>

        <Route path='/order-success/:id' element={<OrderSuccess />} />
        <Route path='/payment/vnpay-return' element={<VnpayReturn />} />
        <Route path='/api/payment/vnpay-return' element={<VnpayReturn />} />

        <Route path='/return-policy' element={<ReturnPolicy />} />
      </Routes>

      <AIChat />
      <Toast />
    </HelmetProvider>
  )
}

export default App
