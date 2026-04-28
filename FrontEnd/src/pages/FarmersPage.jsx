import { useMemo, useState } from 'react'

function FarmerCard({ farmer, loading, onDeleteFarmer }) {
  const products = farmer.products ?? []
  const revenue = Number(farmer.totalEarnings ?? 0)
  const orders = Number(farmer.totalOrders ?? 0)

  return (
    <article className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-base font-bold text-white">
            {farmer.name?.trim()?.[0]?.toUpperCase() || 'F'}
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-950">{farmer.name}</p>
            <p className="text-xs text-emerald-700">{farmer.farmName || 'Farm name not set'}</p>
            <p className="text-xs text-emerald-700">{farmer.email}</p>
          </div>
        </div>
        <span className="app-status">Active</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
          <p className="text-xl font-bold text-emerald-900">{products.length}</p>
          <p className="text-[11px] text-emerald-700">Products</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
          <p className="text-xl font-bold text-amber-500">{orders}</p>
          <p className="text-[11px] text-emerald-700">Orders</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
          <p className="text-xl font-bold text-emerald-700">Rs.{Math.round(revenue)}</p>
          <p className="text-[11px] text-emerald-700">Revenue</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
          <p className="text-xl font-bold text-emerald-900">{products.length ? '4.5' : '-'}</p>
          <p className="text-[11px] text-emerald-700">Rating</p>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs text-emerald-700">
        <p>Phone: {farmer.phone || '-'}</p>
        <p>City: {farmer.location || '-'}</p>
        <p>Specialty: {farmer.specialty || '-'}</p>
      </div>

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

function FarmersPage({ auth, farmers, loading, onDeleteFarmer }) {
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

  const totalProducts = filteredFarmers.reduce((sum, farmer) => sum + (farmer.products?.length ?? 0), 0)
  const totalOrders = filteredFarmers.reduce((sum, farmer) => sum + Number(farmer.totalOrders ?? 0), 0)
  const totalRevenue = filteredFarmers.reduce((sum, farmer) => sum + Number(farmer.totalEarnings ?? 0), 0)

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p className="text-3xl font-extrabold text-emerald-950">Farmer Management</p>
        <p className="mt-1 text-sm text-emerald-700">Monitor farmer profiles, products, and order activity.</p>

        <div className="mt-4 grid grid-cols-2 divide-y divide-emerald-100 overflow-hidden rounded-xl border border-emerald-200 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
          <div className="bg-emerald-50/55 p-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-900">{filteredFarmers.length}</p>
            <p className="text-xs text-emerald-700">Total Farmers</p>
          </div>
          <div className="bg-emerald-50/55 p-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-900">{totalProducts}</p>
            <p className="text-xs text-emerald-700">Active Products</p>
          </div>
          <div className="bg-emerald-50/55 p-3 text-center">
            <p className="text-2xl font-extrabold text-amber-500">{totalOrders}</p>
            <p className="text-xs text-emerald-700">Total Orders</p>
          </div>
          <div className="bg-emerald-50/55 p-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-700">Rs.{Math.round(totalRevenue)}</p>
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
          <button className="app-button app-button-primary h-9 px-4" type="button">
            + Add Farmer
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p className="text-2xl font-bold text-emerald-950">Manage Farmers</p>
        <p className="text-sm text-emerald-700">
          Remove inactive or fraudulent farmers from the platform.
        </p>
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {filteredFarmers.map((farmer) => (
            <FarmerCard key={farmer.id} farmer={farmer} loading={loading} onDeleteFarmer={onDeleteFarmer} />
          ))}
        </div>
        {!filteredFarmers.length && <p className="mt-4 text-sm text-emerald-700">No farmer profiles found.</p>}
      </div>
    </section>
  )
}

export default FarmersPage
