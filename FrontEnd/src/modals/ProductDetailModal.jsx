import ProductImage from '../components/common/ProductImage.jsx'

function ProductDetailModal({ auth, product, cartValue, onClose, onCartChange }) {
  const maxQuantity = Number(product.quantity) || 0
  const currentQuantity = Math.max(0, Math.min(maxQuantity, Number(cartValue) || 0))

  const updateQuantity = (nextValue) => {
    const safeValue = Math.max(0, Math.min(maxQuantity, Number(nextValue) || 0))
    onCartChange((current) => ({ ...current, [product.id]: safeValue }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-4">
      <div className="app-card w-full max-w-2xl p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-emerald-950 sm:text-lg">{product.name}</p>
            <p className="text-sm text-emerald-700">
              Farmer #{product.farmerId} | {product.categoryLabel}
            </p>
          </div>
          <button className="app-button app-button-secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.9fr]">
          <ProductImage product={product} className="h-44 w-full rounded-lg sm:h-56" />
          <div>
            <p className="text-sm text-emerald-700">{product.description || 'No description available.'}</p>
            <p className="mt-3 text-lg font-semibold text-emerald-950 sm:text-xl">Rs. {Number(product.price).toFixed(2)}</p>
            <p className="text-sm text-emerald-700">{product.quantity} in stock</p>
            {auth.user.role === 'USER' && (
              <div className="mt-3">
                <div className="grid h-9 w-[124px] grid-cols-[36px_1fr_36px] overflow-hidden rounded-lg border border-emerald-200 sm:h-10 sm:w-[144px] sm:grid-cols-[40px_1fr_40px]">
                  <button
                    className="inline-flex h-full items-center justify-center bg-emerald-50 text-lg font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    type="button"
                    onClick={() => updateQuantity(currentQuantity - 1)}
                    disabled={currentQuantity <= 0}
                  >
                    -
                  </button>
                  <input
                    className="w-full border-x border-emerald-200 bg-white px-1 text-center text-sm font-semibold text-emerald-950 outline-none sm:text-base"
                    type="number"
                    min="0"
                    max={maxQuantity}
                    value={currentQuantity}
                    onChange={(event) => updateQuantity(parseInt(event.target.value, 10))}
                  />
                  <button
                    className="inline-flex h-full items-center justify-center bg-emerald-50 text-lg font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    type="button"
                    onClick={() => updateQuantity(currentQuantity + 1)}
                    disabled={currentQuantity >= maxQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
