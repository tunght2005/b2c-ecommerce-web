import Banner from '../components/Banner'

interface HeroSectionProps {
  banners: string[]
}

function HeroSection({ banners }: HeroSectionProps) {
  return (
    <section className='max-w-7xl mx-auto px-4 mt-6'>
      <Banner banners={banners} />
    </section>
  )
}

export default HeroSection