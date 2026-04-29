import ProductImage from '../components/common/ProductImage.jsx'

function CartPage({
  cartItems,
  cartTotal,
  loading,
  onCartChange,
  onPlaceOrder,
  paymentMethod = 'COD',
  onPaymentMethodChange,
}) {
  const hasItems = cartItems.length > 0

  return (
    <section className="grid gap-3 sm:gap-4 xl:grid-cols-[0.4fr_0.6fr]">
      <div className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm sm:rounded-4xl sm:p-5">
        <p className="text-2xl font-semibold leading-tight text-emerald-950 sm:text-3xl">Your cart</p>
        <p className="mt-1 text-sm text-emerald-700 sm:text-lg">Review items before checkout</p>

        <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-200 bg-white sm:mt-4 sm:rounded-3xl">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2 border-b border-emerald-100 p-2.5 last:border-b-0 sm:gap-3 sm:p-3">
              <ProductImage product={item} className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24 sm:rounded-2xl" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold leading-tight text-emerald-950 sm:text-2xl">{item.name}</p>
                <p className="mt-1 text-sm text-emerald-700 sm:text-lg">Rs. {Number(item.price).toFixed(2)} each</p>
              </div>

              <div className="grid h-10 w-[120px] grid-cols-[36px_1fr_36px] overflow-hidden rounded-xl border border-emerald-200 sm:h-11 sm:w-[140px] sm:grid-cols-[42px_1fr_42px] sm:rounded-2xl">
                <button
                  className="inline-flex h-full items-center justify-center bg-emerald-50 text-xl font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-2xl"
                  type="button"
                  onClick={() => {
                    const currentValue = item.orderQuantity || 0
                    if (currentValue > 0) {
                      onCartChange((current) => ({ ...current, [item.id]: currentValue - 1 }))
                    }
                  }}
                  disabled={!item.orderQuantity || item.orderQuantity === 0}
                >
                  -
                </button>
                <input
                  className="h-full w-full border-x border-emerald-200 bg-white px-1 text-center text-base font-semibold text-emerald-950 outline-none sm:text-lg"
                  type="number"
                  min="0"
                  max={item.quantity}
                  value={item.orderQuantity}
                  onChange={(event) => {
                    const value = Math.max(0, Math.min(item.quantity, parseInt(event.target.value, 10) || 0))
                    onCartChange((current) => ({ ...current, [item.id]: value }))
                  }}
                />
                <button
                  className="inline-flex h-full items-center justify-center bg-emerald-50 text-xl font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-2xl"
                  type="button"
                  onClick={() => {
                    const currentValue = item.orderQuantity || 0
                    if (currentValue < item.quantity) {
                      onCartChange((current) => ({ ...current, [item.id]: currentValue + 1 }))
                    }
                  }}
                  disabled={item.orderQuantity >= item.quantity}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {!hasItems && (
            <div className="p-5 text-center text-sm text-emerald-700 sm:p-6 sm:text-base">
              Your cart is empty.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:rounded-4xl sm:p-6">
        <p className="text-2xl font-semibold leading-tight text-emerald-950 sm:text-3xl">Order summary</p>
        <div className="mt-4 space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-emerald-800 sm:text-lg">
              <span className="truncate">{item.name} x {item.orderQuantity}</span>
              <span className="shrink-0">Rs. {(Number(item.price) * Number(item.orderQuantity)).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="my-5 h-px bg-emerald-200" />

        <p className="text-sm font-semibold tracking-[0.2em] text-emerald-700">TOTAL</p>
        <p className="mt-1 text-3xl font-bold leading-tight text-emerald-950 sm:text-4xl">Rs. {cartTotal.toFixed(2)}</p>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 sm:rounded-2xl sm:p-4">
          <p className="text-sm font-semibold text-emerald-900 sm:text-base">Payment mode</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition sm:rounded-xl sm:text-base ${
                paymentMethod === 'COD'
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100'
              }`}
              onClick={() => onPaymentMethodChange?.('COD')}
            >
              Cash on Delivery
            </button>
            <button
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition sm:rounded-xl sm:text-base ${
                paymentMethod === 'ONLINE'
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100'
              }`}
              onClick={() => onPaymentMethodChange?.('ONLINE')}
            >
              Online (Razorpay)
            </button>
          </div>
          {paymentMethod === 'ONLINE' && (
            <p className="mt-2 text-xs text-emerald-700 sm:text-sm">
              Razorpay checkout opens as a secure popup. Your order is confirmed after payment verification.
            </p>
          )}
        </div>

        <button
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-700 text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:border-emerald-200 disabled:bg-white disabled:text-emerald-200 sm:h-12 sm:rounded-2xl sm:text-lg"
          type="button"
          onClick={() => onPlaceOrder?.(paymentMethod)}
          disabled={loading || !hasItems}
        >
          {paymentMethod === 'ONLINE' ? 'Pay with Razorpay' : 'Place order (COD)'}
        </button>
        <p className="mt-3 text-center text-sm text-emerald-700 sm:text-lg">
          {paymentMethod === 'ONLINE'
            ? 'Complete payment in the Razorpay popup to place this order'
            : 'Your COD order will be placed instantly'}
        </p>
      </div>
    </section>
  )
}

export default CartPage
