import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Navbar from './components/Navbar'
import AIChat from './components/AIChat'

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

import ProfileLayout from './components/ProfileLayout'
import ProfileInfo from './pages/ProfileInfo'
import ProfileAddresses from './pages/ProfileAddresses'

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
        </Route>

        {/* ORDER DETAILS & ACTIONS (Full Screen) */}
        <Route path='/orders/:id' element={<OrderDetail />} />
        <Route path='/orders/:id/return' element={<ReturnRequest />} />
        <Route path='/orders/:id/cancel-success' element={<CancelSuccess />} />
        <Route path='/order-success/:id' element={<OrderSuccess />} />
        
        <Route path='/return-policy' element={<ReturnPolicy />} />
      </Routes>

      <AIChat />
    </>
  )
}

export default App