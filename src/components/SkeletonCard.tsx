export default function SkeletonCard() {
  return (
    <div className='bg-white rounded-2xl p-3 sm:p-4 shadow-md border animate-pulse'>
      {/* Image placeholder */}
      <div className='bg-gray-200 rounded-xl h-32 sm:h-44 w-full' />

      {/* Content */}
      <div className='mt-3 sm:mt-4 space-y-2'>
        {/* Name */}
        <div className='h-3.5 bg-gray-200 rounded w-full' />
        <div className='h-3.5 bg-gray-200 rounded w-3/4' />

        {/* Rating */}
        <div className='h-3 bg-gray-200 rounded w-16 mt-1' />

        {/* Price */}
        <div className='h-5 bg-gray-200 rounded w-2/3 mt-2' />
        <div className='h-3 bg-gray-200 rounded w-1/2' />

        {/* Button */}
        <div className='h-9 bg-gray-200 rounded-xl mt-3' />
      </div>
    </div>
  )
}
