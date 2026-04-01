import { reviewVideos } from '../data/videos'
import VideoCard from '../components/VideoCard'

export default function VideoSection() {
  return (
    <section className='max-w-7xl mx-auto mt-12 px-4'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold'>
          Video Review Sản Phẩm
        </h2>

        <button className='text-red-500 font-semibold hover:underline'>
          Xem tất cả
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {reviewVideos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </section>
  )
}