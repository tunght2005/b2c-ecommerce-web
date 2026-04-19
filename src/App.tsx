import { Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <>
      <Header />
      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/product/:id' element={<ProductDetail />} />
        <Route path='/category/:name' element={<CategoryPage />} />

        {/* PROFILE NESTED ROUTES */}
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
        <Route path='/order-success/:id' element={<OrderSuccess />} />
        <Route path='/payment/vnpay-return' element={<VnpayReturn />} />
        <Route path='/api/payment/vnpay-return' element={<VnpayReturn />} />

        <Route path='/return-policy' element={<ReturnPolicy />} />
      </Routes>

      <AIChat />
      <Toast />
    </>
  )
}

export default App
