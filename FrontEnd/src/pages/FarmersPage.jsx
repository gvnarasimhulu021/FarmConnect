import { useMemo, useState } from 'react'

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isOnlinePayment(method) {
  const normalized = String(method ?? '').toUpperCase()
  return normalized === 'ONLINE' || normalized === 'RAZORPAY'
}

function buildFarmerTransactionSummary(farmerId, orders = []) {
  const summary = {
    totalTransactions: 0,
    totalAmount: 0,
    onlineTransactions: 0,
    onlineAmount: 0,
    codTransactions: 0,
    codAmount: 0,
    pendingOnlinePayoutOrders: [],
  }

  const targetFarmerId = Number(farmerId)
  if (!Number.isFinite(targetFarmerId)) {
    return summary
  }

  for (const order of orders) {
    const items = Array.isArray(order?.items) ? order.items : []
    const farmerItems = items.filter((item) => Number(item?.farmerId) === targetFarmerId)
    if (!farmerItems.length) {
      continue
    }

    const farmerAmount = farmerItems.reduce(
      (sum, item) => sum + toNumber(item?.price) * Math.max(0, toNumber(item?.quantity)),
      0
    )

    summary.totalTransactions += 1
    summary.totalAmount += farmerAmount

    if (isOnlinePayment(order?.paymentMethod)) {
      summary.onlineTransactions += 1
      summary.onlineAmount += farmerAmount

      const payoutPending =
        order?.status === 'DELIVERED'
        && order?.paymentStatus === 'SUCCESS'
        && order?.farmerPaymentStatus !== 'PAID'
        && !order?.payoutCompleted

      if (payoutPending) {
        summary.pendingOnlinePayoutOrders.push({
          id: order.id,
          amount: farmerAmount,
        })
      }
    } else {
      summary.codTransactions += 1
      summary.codAmount += farmerAmount
    }
  }

  return summary
}

function FarmerCard({ farmer, loading, onDeleteFarmer, transactionSummary, onCompletePayout }) {
  const products = farmer.products ?? []
  const revenue = Number(farmer.totalEarnings ?? transactionSummary?.totalAmount ?? 0)
  const transactions = Number(transactionSummary?.totalTransactions ?? farmer.totalOrders ?? 0)
  const onlineTransactions = Number(transactionSummary?.onlineTransactions ?? 0)
  const onlineAmount = Number(transactionSummary?.onlineAmount ?? 0)
  const codTransactions = Number(transactionSummary?.codTransactions ?? 0)
  const codAmount = Number(transactionSummary?.codAmount ?? 0)
  const pendingPayoutOrders = transactionSummary?.pendingOnlinePayoutOrders ?? []
  const payoutPreview = pendingPayoutOrders.slice(0, 3)
  const extraPayoutCount = Math.max(0, pendingPayoutOrders.length - payoutPreview.length)

  return (
    <article className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-base font-bold text-white">
            {farmer.name?.trim()?.[0]?.toUpperCase() || 'F'}
          </div>
          <div>
            <p className="text-base font-bold text-emerald-950 sm:text-lg">{farmer.name}</p>
            <p className="text-xs text-emerald-700">{farmer.farmName || 'Farm name not set'}</p>
            <p className="text-xs text-emerald-700">{farmer.email}</p>
          </div>
        </div>
        <span className="app-status">Active</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
          <p className="text-lg font-bold text-emerald-900 sm:text-xl">{products.length}</p>
          <p className="text-[11px] text-emerald-700">Products</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
          <p className="text-lg font-bold text-amber-500 sm:text-xl">{transactions}</p>
          <p className="text-[11px] text-emerald-700">Transactions</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
          <p className="text-lg font-bold text-emerald-700 sm:text-xl">Rs.{Math.round(revenue)}</p>
          <p className="text-[11px] text-emerald-700">Total Value</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
          <p className="text-lg font-bold text-emerald-900 sm:text-xl">{onlineTransactions + codTransactions}</p>
          <p className="text-[11px] text-emerald-700">Payment Count</p>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs text-emerald-700">
        <p>Phone: {farmer.phone || '-'}</p>
        <p>City: {farmer.location || '-'}</p>
        <p>Specialty: {farmer.specialty || '-'}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">ONLINE</p>
          <p className="text-sm font-bold text-emerald-900">{onlineTransactions} transactions</p>
          <p className="text-xs text-emerald-700">Rs.{onlineAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">COD</p>
          <p className="text-sm font-bold text-emerald-900">{codTransactions} transactions</p>
          <p className="text-xs text-emerald-700">Rs.{codAmount.toFixed(2)}</p>
        </div>
      </div>

      {!!payoutPreview.length && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            Online Payment - Pay to Farmer
          </p>
          <div className="mt-2 space-y-2">
            {payoutPreview.map((order) => (
              <div key={`${farmer.id}-${order.id}`} className="flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-white px-2 py-2">
                <div>
                  <p className="text-xs font-semibold text-emerald-900">Order #{order.id}</p>
                  <p className="text-[11px] text-emerald-700">Amount Rs.{order.amount.toFixed(2)}</p>
                </div>
                <button
                  className="app-button app-button-secondary h-8 px-3 text-xs"
                  type="button"
                  onClick={() => onCompletePayout?.(order.id)}
                  disabled={loading}
                >
                  Pay Farmer
                </button>
              </div>
            ))}
            {extraPayoutCount > 0 && (
              <p className="text-[11px] text-emerald-700">+{extraPayoutCount} more pending online payouts</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 border-t border-emerald-100 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Products Listed</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {products.length ? (
            products.slice(0, 6).map((product) => (
              <span
                key={`${farmer.id}-${product.id}-${product.name}`}
                className="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-800"
              >
                {product.name} {Number(product.quantity) || 0}k
              </span>
            ))
          ) : (
            <span className="text-xs text-emerald-600">No products listed yet</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="app-button app-button-secondary h-9 flex-1" type="button">
          View Details
        </button>
        <button
          className="app-button app-button-danger h-9 flex-1"
          type="button"
          onClick={() => onDeleteFarmer(farmer.id)}
          disabled={loading}
        >
          Remove Farmer
        </button>
      </div>
    </article>
  )
}

function FarmersPage({ auth, farmers, orders = [], loading, onDeleteFarmer, onCompletePayout }) {
  const [searchText, setSearchText] = useState('')

  if (auth.user.role !== 'ADMIN') {
    return (
      <section className="app-card p-4">
        <p className="app-section-title">Access denied</p>
        <p className="mt-2 text-sm text-emerald-700">Only admins can manage farmers.</p>
      </section>
    )
  }

  const query = searchText.trim().toLowerCase()
  const filteredFarmers = useMemo(
    () =>
      farmers.filter((farmer) => {
        if (!query) return true
        return [farmer.name, farmer.farmName, farmer.email, farmer.location]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      }),
    [farmers, query]
  )

  const farmerTransactionMap = useMemo(() => {
    const map = new Map()
    filteredFarmers.forEach((farmer) => {
      map.set(Number(farmer.id), buildFarmerTransactionSummary(farmer.id, orders))
    })
    return map
  }, [filteredFarmers, orders])

  const totalProducts = filteredFarmers.reduce((sum, farmer) => sum + (farmer.products?.length ?? 0), 0)
  const totalTransactions = filteredFarmers.reduce(
    (sum, farmer) => sum + Number(farmerTransactionMap.get(Number(farmer.id))?.totalTransactions ?? 0),
    0
  )
  const totalRevenue = filteredFarmers.reduce(
    (sum, farmer) => sum + Number(farmerTransactionMap.get(Number(farmer.id))?.totalAmount ?? farmer.totalEarnings ?? 0),
    0
  )

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p className="text-2xl font-extrabold text-emerald-950 sm:text-3xl">Farmer Management</p>
        <p className="mt-1 text-sm text-emerald-700">Monitor farmer profiles, products, and order activity.</p>

        <div className="mt-4 grid grid-cols-2 divide-y divide-emerald-100 overflow-hidden rounded-xl border border-emerald-200 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
          <div className="bg-emerald-50/55 p-3 text-center">
            <p className="text-xl font-extrabold text-emerald-900 sm:text-2xl">{filteredFarmers.length}</p>
            <p className="text-xs text-emerald-700">Total Farmers</p>
          </div>
          <div className="bg-emerald-50/55 p-3 text-center">
            <p className="text-xl font-extrabold text-emerald-900 sm:text-2xl">{totalProducts}</p>
            <p className="text-xs text-emerald-700">Active Products</p>
          </div>
          <div className="bg-emerald-50/55 p-3 text-center">
            <p className="text-xl font-extrabold text-amber-500 sm:text-2xl">{totalTransactions}</p>
            <p className="text-xs text-emerald-700">Total Transactions</p>
          </div>
          <div className="bg-emerald-50/55 p-3 text-center">
            <p className="text-xl font-extrabold text-emerald-700 sm:text-2xl">Rs.{Math.round(totalRevenue)}</p>
            <p className="text-xs text-emerald-700">Revenue Generated</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            className="app-input h-9 w-full max-w-sm"
            placeholder="Search farmers..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <button className="app-button app-button-secondary h-9 px-4" type="button">
            Export Report
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p className="text-xl font-bold text-emerald-950 sm:text-2xl">Manage Farmers</p>
        <p className="text-sm text-emerald-700">
          Remove inactive or fraudulent farmers from the platform.
        </p>
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {filteredFarmers.map((farmer) => (
            <FarmerCard
              key={farmer.id}
              farmer={farmer}
              loading={loading}
              transactionSummary={farmerTransactionMap.get(Number(farmer.id))}
              onDeleteFarmer={onDeleteFarmer}
              onCompletePayout={onCompletePayout}
            />
          ))}
        </div>
        {!filteredFarmers.length && <p className="mt-4 text-sm text-emerald-700">No farmer profiles found.</p>}
      </div>
    </section>
  )
}

export default FarmersPage
