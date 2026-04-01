import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Navbar from './components/Navbar'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'

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
      </Routes>
    </>
  )
}

export default App