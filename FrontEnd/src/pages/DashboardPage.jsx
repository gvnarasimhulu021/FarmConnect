function OverviewMetric({ label, value, accent = 'emerald' }) {
  const accentMap = {
    emerald: 'border-t-4 border-t-emerald-600 bg-emerald-50/70',
    mint: 'border-t-4 border-t-emerald-400 bg-emerald-50/55',
    amber: 'border-t-4 border-t-amber-400 bg-amber-50/70',
  }

  return (
    <div className={`rounded-xl border border-emerald-200 p-4 ${accentMap[accent] ?? accentMap.emerald}`}>
      <p className="text-3xl font-extrabold text-emerald-900 sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">{label}</p>
    </div>
  )
}

function RevenueBars({ farmers }) {
  const barData = farmers.slice(0, 4).map((farmer) => ({
    label: farmer.name?.slice(0, 3)?.toUpperCase() || 'FRM',
    value: Number(farmer.totalEarnings ?? 0),
  }))
  const max = Math.max(...barData.map((bar) => bar.value), 1)

  return (
    <div className="mt-2 flex h-28 items-end gap-2">
      {barData.map((bar) => (
        <div key={`${bar.label}-${bar.value}`} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-lg bg-emerald-300/80"
            style={{ height: `${Math.max(16, Math.round((bar.value / max) * 88))}px` }}
          />
          <p className="text-[10px] font-semibold text-emerald-700">{bar.label}</p>
        </div>
      ))}
    </div>
  )
}

function DashboardPage({ auth, products, farmers, orders, stats, authUsers, setActiveView }) {
  if (auth.user.role === 'ADMIN') {
    const totalAccounts = authUsers.length
    const adminCount = authUsers.filter((user) => user.role === 'ADMIN').length
    const consumerCount = authUsers.filter((user) => user.role === 'USER').length
    const farmerCount = authUsers.filter((user) => user.role === 'FARMER').length
    const revenue = `Rs.${Math.round(Number(stats.totalSales ?? 0))}`

    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-extrabold text-emerald-950 sm:text-3xl">Platform Overview</p>
          <p className="mt-1 text-sm text-emerald-700">Analytics and platform-wide operations.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewMetric label="Accounts" value={totalAccounts} accent="emerald" />
            <OverviewMetric label="Farmers" value={farmerCount} accent="mint" />
            <OverviewMetric label="Orders" value={orders.length} accent="amber" />
            <OverviewMetric label="Revenue" value={revenue} accent="mint" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="app-button app-button-primary" type="button" onClick={() => setActiveView('users')}>
              Manage Users
            </button>
            <button className="app-button app-button-secondary" type="button" onClick={() => setActiveView('farmers')}>
              Manage Farmers
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <p className="text-xl font-bold text-emerald-950 sm:text-2xl">Account Health</p>
            <p className="mt-1 text-sm text-emerald-700">All account control is available from Users tab.</p>
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">Admins</p>
              <p className="text-2xl font-extrabold text-emerald-900 sm:text-3xl">{adminCount}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-900">Consumers</p>
              <p className="text-2xl font-extrabold text-emerald-900 sm:text-3xl">{consumerCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <p className="text-xl font-bold text-emerald-950 sm:text-2xl">Recent Activity</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                <p className="text-sm font-medium text-emerald-900">Products listed</p>
                <p className="text-sm font-bold text-emerald-800">{products.length}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                <p className="text-sm font-medium text-emerald-900">Orders placed</p>
                <p className="text-sm font-bold text-emerald-800">{orders.length}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                <p className="text-sm font-medium text-emerald-900">Active farmers</p>
                <p className="text-sm font-bold text-emerald-800">{farmers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xl font-bold text-emerald-950 sm:text-2xl">Farmer Overview</p>
              <p className="text-sm text-emerald-700">Monitor farmer activity and product listings.</p>
            </div>
            <div className="w-full max-w-xs sm:w-52">
              <p className="text-sm font-semibold text-emerald-800">Revenue Trend</p>
              <RevenueBars farmers={farmers} />
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Farm Name</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Orders</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <tr key={farmer.id}>
                    <td className="font-semibold">{farmer.name}</td>
                    <td>{farmer.farmName || '-'}</td>
                    <td>{farmer.email}</td>
                    <td>{farmer.products?.length ?? 0}</td>
                    <td>{farmer.totalOrders ?? 0}</td>
                    <td>
                      <span className="app-status">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="app-card p-4">
        <p className="app-section-title">Farmer dashboard</p>
        <p className="app-section-subtitle">Track inventory, orders, and earnings.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewMetric label="My products" value={products.length} accent="emerald" />
          <OverviewMetric label="My orders" value={orders.length} accent="mint" />
          <OverviewMetric label="Delivered" value={stats.delivered} accent="mint" />
          <OverviewMetric label="Earnings" value={`Rs. ${Math.round(Number(stats.earnings ?? 0))}`} accent="amber" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="app-button app-button-primary" type="button" onClick={() => setActiveView('inventory')}>
            Go to inventory
          </button>
          <button className="app-button app-button-secondary" type="button" onClick={() => setActiveView('orders')}>
            View orders
          </button>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
