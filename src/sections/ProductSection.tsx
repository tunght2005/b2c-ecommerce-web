import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function ProductSection() {
  return (
    <section className='max-w-7xl mx-auto mt-8 sm:mt-12 px-4'>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 border-l-4 border-red-500 pl-3">
        Sản phẩm nổi bật
      </h2>
      
      {/* Lưới sản phẩm Responsive */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}