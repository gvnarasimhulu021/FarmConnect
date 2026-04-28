import ProductImage from '../components/common/ProductImage.jsx'

function ProductDetailModal({ auth, product, cartValue, onClose, onCartChange }) {
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
              <div className="mt-3 flex gap-2">
                <input
                  className="app-input h-9 w-20 sm:h-10 sm:w-24"
                  type="number"
                  min="0"
                  max={product.quantity}
                  value={cartValue}
                  onChange={(event) => onCartChange((current) => ({ ...current, [product.id]: event.target.value }))}
                />
                <button
                  className="app-button app-button-primary flex-1"
                  type="button"
                  onClick={() => onCartChange((current) => ({ ...current, [product.id]: current[product.id] || 1 }))}
                >
                  Add to cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
