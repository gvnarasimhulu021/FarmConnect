import { orderStatuses } from '../app/constants.js'

const userTrackingSteps = ['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED']
const stepLabels = ['Placed', 'Packed', 'Shipped', 'Delivered']

function normalizeStepIndex(status) {
  if (status === 'ACCEPTED' || status === 'PACKED') return 1
  const index = userTrackingSteps.indexOf(status)
  return index >= 0 ? index : 0
}

function formatStatus(status) {
  return status?.charAt(0) + status?.slice(1).toLowerCase()
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

  if (status === 'SHIPPED') {
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

function OrdersPage({ auth, orders, onAdvanceOrder }) {
  const isManager = auth.user.role === 'FARMER' || auth.user.role === 'ADMIN'
  const isUser = auth.user.role === 'USER'

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
      <section className="overflow-hidden rounded-4xl border border-emerald-200 bg-white shadow-sm">
        <div className="border-b border-emerald-200 bg-emerald-50/60 px-5 py-6 sm:px-7">
          <p className="text-3xl font-semibold leading-tight text-emerald-950">Your orders</p>
          <p className="mt-2 text-xl text-emerald-700">Live status updates for all your placed orders</p>
        </div>

        <div className="overflow-x-auto px-4 pb-4 sm:px-5 sm:pb-5">
          <table className="min-w-[860px] w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-emerald-200 px-3 py-4 text-left text-lg font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Order
                </th>
                <th className="border-b border-emerald-200 px-3 py-4 text-left text-lg font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Items
                </th>
                <th className="border-b border-emerald-200 px-3 py-4 text-left text-lg font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Status
                </th>
                <th className="border-b border-emerald-200 px-3 py-4 text-right text-lg font-semibold uppercase tracking-[0.12em] text-emerald-700">
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
                    <td className="border-b border-emerald-100 px-3 py-4 align-top text-3xl font-bold text-emerald-950">#{order.id}</td>
                    <td className="border-b border-emerald-100 px-3 py-4 align-top text-2xl text-emerald-800">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="border-b border-emerald-100 px-3 py-4 align-top">
                      <div className="max-w-[420px]">
                        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-2xl font-semibold ${style.pill}`}>
                          <span className={`h-3.5 w-3.5 rounded-full ${style.dot}`} />
                          {formatStatus(order.status)}
                        </span>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {[0, 1, 2].map((segmentIndex) => (
                            <span
                              key={segmentIndex}
                              className={`h-2.5 rounded-full ${
                                segmentIndex < activeIndex ? style.activeTrack : style.inactiveTrack
                              }`}
                            />
                          ))}
                        </div>

                        <div className="mt-2 grid grid-cols-4 text-xs text-emerald-700">
                          {stepLabels.map((label) => (
                            <span key={label}>{label}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-emerald-100 px-3 py-4 text-right align-top text-2xl font-semibold text-emerald-800">
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
                      className="app-input h-10 min-w-[140px]"
                      value={order.status}
                      onChange={(event) => onAdvanceOrder(order.id, event.target.value)}
                    >
                      {orderStatuses.map((status) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default OrdersPage
