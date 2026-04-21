import { useRef, useState, useEffect } from 'react'
import { Play, Volume2, VolumeX, Heart } from 'lucide-react'

type Video = {
  video: string
  thumbnail: string
  title: string
  description: string
}

type Props = {
  video: Video
}

export default function VideoCard({ video }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [liked, setLiked] = useState(false)

  // 🎯 update progress
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const update = () => {
      const percent = (v.currentTime / (v.duration || 1)) * 100
      setProgress(percent)
    }

    v.addEventListener('timeupdate', update)
    return () => v.removeEventListener('timeupdate', update)
  }, [])

  // ▶ play
  const handlePlay = () => {
    if (!videoRef.current) return
    videoRef.current.play()
    setIsPlaying(true)
  }

  // ⏸ pause
  const handlePause = () => {
    if (!videoRef.current) return
    videoRef.current.pause()
    setIsPlaying(false)
  }

  // 🔊 mute
  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <div className='bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition group'>
      {/* VIDEO */}
      <div className='relative h-[220px] bg-black'>
        {/* VIDEO ELEMENT */}
        <video ref={videoRef} src={video.video} muted className='w-full h-full object-cover' />

        {/* THUMB */}
        {!isPlaying && (
          <>
            <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
              <button onClick={handlePlay} className='bg-white p-3 rounded-full shadow'>
                <Play className='text-red-500 ml-1' />
              </button>
            </div>
          </>
        )}

        {/* CONTROLS */}
        {isPlaying && (
          <div className='absolute bottom-2 left-2 right-2 flex justify-between items-center text-white text-sm'>
            <button onClick={handlePause}>⏸</button>

            <div className='flex gap-3'>
              <button onClick={toggleMute}>{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>

              <button onClick={() => setLiked(!liked)}>
                <Heart size={16} className={liked ? 'text-red-500' : ''} />
              </button>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        <div className='absolute bottom-0 left-0 w-full h-1 bg-white/30'>
          <div className='h-full bg-red-500' style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* INFO */}
      <div className='p-4'>
        <h3 className='font-semibold text-gray-800 line-clamp-2'>{video.title}</h3>
        <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{video.description}</p>
      </div>
    </div>
  )
}
