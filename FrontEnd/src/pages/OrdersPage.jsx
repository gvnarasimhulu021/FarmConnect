const userTrackingSteps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
const stepLabels = ['Placed', 'Confirmed', 'Shipped', 'Out for delivery', 'Delivered']

function normalizeStepIndex(status) {
  const index = userTrackingSteps.indexOf(status)
  return index >= 0 ? index : 0
}

function getStatusOptions(currentStatus) {
  const currentIndex = userTrackingSteps.indexOf(currentStatus)
  if (currentIndex < 0 || currentIndex >= userTrackingSteps.length - 1) {
    return [currentStatus]
  }
  return [currentStatus, userTrackingSteps[currentIndex + 1]]
}

function formatStatus(status) {
  if (!status) return ''
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function isOnlinePayment(paymentMethod) {
  return paymentMethod === 'ONLINE' || paymentMethod === 'RAZORPAY'
}

function formatPaymentMethod(method) {
  if (isOnlinePayment(method)) return 'ONLINE'
  return method || 'COD'
}

function openPaymentLink(link) {
  if (!link) {
    return
  }
  const opened = window.open(link, '_blank', 'noopener,noreferrer')
  if (!opened) {
    window.location.href = link
  }
}

function getUserStatusStyle(status) {
  if (status === 'DELIVERED') {
    return {
      pill: 'bg-emerald-100 text-emerald-800',
      dot: 'bg-emerald-700',
      activeTrack: 'bg-emerald-700',
      inactiveTrack: 'bg-emerald-100',
    }
  }

  if (status === 'SHIPPED' || status === 'OUT_FOR_DELIVERY') {
    return {
      pill: 'bg-blue-100 text-blue-700',
      dot: 'bg-blue-600',
      activeTrack: 'bg-emerald-700',
      inactiveTrack: 'bg-emerald-100',
    }
  }

  return {
    pill: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-700',
    activeTrack: 'bg-emerald-700',
    inactiveTrack: 'bg-emerald-100',
  }
}

function OrdersPage({ auth, orders, onAdvanceOrder, onCompletePayout, onRefreshOrders, onConfirmPayment }) {
  const isManager = auth.user.role === 'FARMER' || auth.user.role === 'ADMIN'
  const isUser = auth.user.role === 'USER'
  const isAdmin = auth.user.role === 'ADMIN'

  if (!orders.length) {
    return (
      <section className="app-card p-4">
        <p className="app-section-title">{isUser ? 'Order tracking' : 'Orders'}</p>
        <p className="mt-2 text-sm text-emerald-700">No orders available yet.</p>
      </section>
    )
  }

  if (isUser) {
    return (
      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm sm:rounded-4xl">
        <div className="border-b border-emerald-200 bg-emerald-50/60 px-4 py-4 sm:px-7 sm:py-6">
          <p className="text-2xl font-semibold leading-tight text-emerald-950 sm:text-3xl">Your orders</p>
          <p className="mt-1 text-sm text-emerald-700 sm:mt-2 sm:text-xl">Live status updates for all your placed orders</p>
        </div>

        <div className="space-y-2 p-3 sm:hidden">
          {orders.map((order) => {
            const activeIndex = normalizeStepIndex(order.status)
            const style = getUserStatusStyle(order.status)

            return (
              <article key={order.id} className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold text-emerald-950">#{order.id}</p>
                    <p className="text-xs text-emerald-700">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-xs text-emerald-700">
                      {formatPaymentMethod(order.paymentMethod)} / {order.paymentStatus}
                    </p>
                  </div>
                  <p className="text-base font-semibold text-emerald-800">Rs. {Number(order.totalAmount).toFixed(2)}</p>
                </div>

                {isOnlinePayment(order.paymentMethod) && order.paymentStatus !== 'SUCCESS' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="app-button h-8 px-3 text-xs"
                      onClick={() => openPaymentLink(order.paymentLink)}
                    >
                      Pay now
                    </button>
                    <button
                      type="button"
                      className="app-button app-button-secondary h-8 px-3 text-xs"
                      onClick={() => onConfirmPayment?.(order.id)}
                    >
                      Confirm payment
                    </button>
                  </div>
                )}

                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.pill}`}>
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3].map((segmentIndex) => (
                    <span
                      key={segmentIndex}
                      className={`h-1.5 rounded-full ${
                        segmentIndex < activeIndex ? style.activeTrack : style.inactiveTrack
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-5 text-[11px] text-emerald-700">
                  {stepLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        <div className="hidden overflow-x-auto px-4 pb-4 sm:block sm:px-5 sm:pb-5">
          <table className="min-w-[640px] w-full border-collapse sm:min-w-[860px]">
            <thead>
              <tr>
                <th className="border-b border-emerald-200 px-2 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700 sm:px-3 sm:py-4 sm:text-lg sm:tracking-[0.12em]">
                  Order
                </th>
                <th className="border-b border-emerald-200 px-2 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700 sm:px-3 sm:py-4 sm:text-lg sm:tracking-[0.12em]">
                  Items
                </th>
                <th className="border-b border-emerald-200 px-2 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700 sm:px-3 sm:py-4 sm:text-lg sm:tracking-[0.12em]">
                  Status
                </th>
                <th className="border-b border-emerald-200 px-2 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700 sm:px-3 sm:py-4 sm:text-lg sm:tracking-[0.12em]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const activeIndex = normalizeStepIndex(order.status)
                const style = getUserStatusStyle(order.status)

                return (
                  <tr key={order.id}>
                    <td className="border-b border-emerald-100 px-2 py-3 align-top text-xl font-bold text-emerald-950 sm:px-3 sm:py-4 sm:text-3xl">#{order.id}</td>
                    <td className="border-b border-emerald-100 px-2 py-3 align-top text-base text-emerald-800 sm:px-3 sm:py-4 sm:text-2xl">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      <p className="mt-1 text-xs text-emerald-700 sm:text-sm">
                        {formatPaymentMethod(order.paymentMethod)} / {order.paymentStatus}
                      </p>
                      {isOnlinePayment(order.paymentMethod) && order.paymentStatus !== 'SUCCESS' && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="app-button h-8 px-3 text-xs"
                            onClick={() => openPaymentLink(order.paymentLink)}
                          >
                            Pay now
                          </button>
                          <button
                            type="button"
                            className="app-button app-button-secondary h-8 px-3 text-xs"
                            onClick={() => onConfirmPayment?.(order.id)}
                          >
                            Confirm payment
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="border-b border-emerald-100 px-2 py-3 align-top sm:px-3 sm:py-4">
                      <div className="max-w-[420px]">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold sm:gap-2 sm:px-4 sm:py-2 sm:text-2xl ${style.pill}`}>
                          <span className={`h-2.5 w-2.5 rounded-full sm:h-3.5 sm:w-3.5 ${style.dot}`} />
                          {formatStatus(order.status)}
                        </span>

                        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:mt-3 sm:gap-2">
                          {[0, 1, 2, 3].map((segmentIndex) => (
                            <span
                              key={segmentIndex}
                              className={`h-2 rounded-full sm:h-2.5 ${
                                segmentIndex < activeIndex ? style.activeTrack : style.inactiveTrack
                              }`}
                            />
                          ))}
                        </div>

                        <div className="mt-2 grid grid-cols-5 text-xs text-emerald-700">
                          {stepLabels.map((label) => (
                            <span key={label}>{label}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-emerald-100 px-2 py-3 text-right align-top text-lg font-semibold text-emerald-800 sm:px-3 sm:py-4 sm:text-2xl">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <section className="app-card p-4">
      <p className="app-section-title">Order management</p>
      <p className="app-section-subtitle">
        Monitor incoming orders and update status.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Items</th>
              <th>Status</th>
              <th>Total</th>
              {isAdmin && <th>Payout</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.items.length}</td>
                <td>
                  {isManager && order.status !== 'DELIVERED' ? (
                    <select
                      className="app-input h-9 min-w-[120px] sm:h-10 sm:min-w-[140px]"
                      value={order.status}
                      onFocus={() => onRefreshOrders?.()}
                      onChange={(event) => onAdvanceOrder(order.id, event.target.value)}
                    >
                      {getStatusOptions(order.status).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="app-status">{order.status}</span>
                  )}
                </td>
                <td>Rs. {Number(order.totalAmount).toFixed(2)}</td>
                {isAdmin && (
                  <td>
                    {order.status === 'DELIVERED' && order.farmerPaymentStatus !== 'PAID' ? (
                      <button
                        type="button"
                        className="app-button app-button-secondary h-9 px-3 text-xs sm:h-10 sm:text-sm"
                        onClick={() => onCompletePayout?.(order.id)}
                      >
                        Complete payout
                      </button>
                    ) : order.farmerPaymentStatus === 'PAID' || order.payoutCompleted ? (
                      <span className="app-status">Completed</span>
                    ) : order.status === 'DELIVERED' && order.paymentStatus !== 'SUCCESS' ? (
                      <span className="text-xs text-amber-700">Confirm payment first</span>
                    ) : (
                      <span className="text-xs text-emerald-700">After delivery</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default OrdersPage
