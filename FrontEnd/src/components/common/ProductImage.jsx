import { useEffect, useState } from 'react'

function ProductImage({ product, className }) {
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => {
    setImageFailed(false)
  }, [product.imageUrl])

  if (product.imageUrl && !imageFailed) {
    return (
      <div className={`${className} relative overflow-hidden bg-emerald-50`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-[center_40%]"
          onError={() => setImageFailed(true)}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-emerald-50/90 via-emerald-50/55 to-transparent" />
      </div>
    )
  }

  return (
    <div className={`${className} flex items-end overflow-hidden bg-gradient-to-br from-green-100 via-green-50 to-sky-50 p-5`}>
      <div className="w-full">
        <div className="h-2 w-16 rounded-full bg-green-300/70" />
        <div className="mt-3 h-8 w-8 rounded-full bg-green-500/80" />
      </div>
    </div>
  )
}

export default ProductImage
