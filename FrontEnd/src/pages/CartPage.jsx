import ProductImage from '../components/common/ProductImage.jsx'

function CartPage({ cartItems, cartTotal, loading, onCartChange, onPlaceOrder }) {
  const hasItems = cartItems.length > 0

  return (
    <section className="grid gap-4 xl:grid-cols-[0.4fr_0.6fr]">
      <div className="rounded-4xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-3xl font-semibold leading-tight text-emerald-950">Your cart</p>
        <p className="mt-1 text-lg text-emerald-700">Review items before checkout</p>

        <div className="mt-4 overflow-hidden rounded-3xl border border-emerald-200 bg-white">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b border-emerald-100 p-3 last:border-b-0">
              <ProductImage product={item} className="h-24 w-24 shrink-0 rounded-2xl" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-2xl font-semibold leading-tight text-emerald-950">{item.name}</p>
                <p className="mt-1 text-lg text-emerald-700">Rs. {Number(item.price).toFixed(2)} each</p>
              </div>

              <div className="grid h-11 w-[140px] grid-cols-[42px_1fr_42px] overflow-hidden rounded-2xl border border-emerald-200">
                <button
                  className="inline-flex h-full items-center justify-center bg-emerald-50 text-2xl font-semibold text-emerald-700 transition hover:bg-emerald-100"
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
                  className="h-full w-full border-x border-emerald-200 bg-white px-1 text-center text-lg font-semibold text-emerald-950 outline-none"
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
                  className="inline-flex h-full items-center justify-center bg-emerald-50 text-2xl font-semibold text-emerald-700 transition hover:bg-emerald-100"
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
            <div className="p-6 text-center text-base text-emerald-700">
              Your cart is empty.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-4xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-3xl font-semibold leading-tight text-emerald-950">Order summary</p>
        <div className="mt-4 space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-lg text-emerald-800">
              <span className="truncate">{item.name} × {item.orderQuantity}</span>
              <span className="shrink-0">Rs. {(Number(item.price) * Number(item.orderQuantity)).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="my-5 h-px bg-emerald-200" />

        <p className="text-sm font-semibold tracking-[0.2em] text-emerald-700">TOTAL</p>
        <p className="mt-1 text-4xl font-bold leading-tight text-emerald-950">Rs. {cartTotal.toFixed(2)}</p>

        <button
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-700 text-lg font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:border-emerald-200 disabled:bg-white disabled:text-emerald-200"
          type="button"
          onClick={onPlaceOrder}
          disabled={loading || !hasItems}
        >
          Place order
        </button>
        <p className="mt-3 text-center text-lg text-emerald-700">Your order will be confirmed instantly</p>
      </div>
    </section>
  )
}

export default CartPage
