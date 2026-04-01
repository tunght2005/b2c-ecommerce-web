import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function ProductSection() {
  return (
    <section className='max-w-7xl mx-auto mt-10 grid grid-cols-4 gap-4'>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </section>
  )
}