import { useState, useEffect, useRef, type CSSProperties } from 'react'

type LazyImageProps = {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  width: number
  height: number
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  fetchPriority?: 'high' | 'low' | 'auto'
  aspectRatio?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  aspectRatio,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>( null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) {
      return
    }

    const handleLoad = () => {
      setIsLoaded(true)
      onLoad?.()
    }

    const handleError = () => {
      setHasError(true)
      onError?.()
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)

    // Se a imagem já está carregada (cache)
    if (img.complete && img.naturalHeight !== 0) {
      setIsLoaded(true)
    }

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [onLoad, onError])

  const aspectRatioStyle = aspectRatio ? { aspectRatio } : {}
  const containerStyle: CSSProperties = {
    ...aspectRatioStyle,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  }

  return (
    <div className={`lazy-image-container ${className}`} style={containerStyle}>
      {!isLoaded && !hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(243, 251, 248, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(20, 52, 40, 0.1)',
              borderTopColor: 'rgba(20, 52, 40, 0.4)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

