import { useEffect, useState } from 'react'
import Banner from '../components/Banner'
import ScrollTop from '../components/ScrollTop'
import Footer from '../components/Footer'

import ProductSection from '../sections/ProductSection'
import CategorySection from '../sections/CategorySection'
import VideoSection from '../sections/VideoSection'

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Banner />

      {/* Sản phẩm nổi bật */}
      <ProductSection />

      {/* Category */}
      <CategorySection
        title='ĐIỆN THOẠI'
        banner='/01KK8E4NQYFFSS1BRHNV4WXZZP.webp'
      />

      <CategorySection
        title='LAPTOP'
        banner='/01KK84Q078JE7HEGK1SF3GGZGZ.webp'
      />

      <CategorySection
        title='ĐỒNG HỒ'
        banner='/01KG6K3S7WG02MXRFGD9N1WQQE.webp'
      />

      <CategorySection
        title='PHỤ KIỆN'
        banner='/01KM2Q70GFVDKYHVN3SR9SWAGK.webp'
      />

      {/* Video */}
      <VideoSection />

      {/* Footer */}
      <Footer />

      {/* Scroll */}
      <ScrollTop show={showScrollTop} />
    </>
  )
}