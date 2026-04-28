import { useMemo, useState } from 'react'

const roleFilters = ['ALL', 'ADMIN', 'USER', 'FARMER']
const joinedLabels = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024']

function ProfileRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-emerald-700">{label}</p>
      <p className="mt-1 text-sm font-semibold text-emerald-950">{value ?? '-'}</p>
    </div>
  )
}

function UsersPage({ auth, users, authUsers, farmers = [], loading, onDeleteUser }) {
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [selectedUserId, setSelectedUserId] = useState(null)

  if (auth.user.role !== 'ADMIN') {
    return (
      <section className="app-card p-4">
        <p className="app-section-title">Access denied</p>
        <p className="mt-2 text-sm text-emerald-700">Only admins can manage users.</p>
      </section>
    )
  }

  const profileById = new Map(users.map((user) => [user.id, user]))
  const farmerById = new Map(farmers.map((farmer) => [farmer.id, farmer]))
  const searchTerm = searchText.trim().toLowerCase()

  const filteredUsers = useMemo(
    () =>
      authUsers.filter((user) => {
        const roleMatch = roleFilter === 'ALL' || user.role === roleFilter
        const searchMatch =
          !searchTerm ||
          [user.name, user.email, user.role].some((value) => value?.toLowerCase().includes(searchTerm))
        return roleMatch && searchMatch
      }),
    [authUsers, roleFilter, searchTerm]
  )

  const totalUsers = authUsers.length
  const adminCount = authUsers.filter((user) => user.role === 'ADMIN').length
  const consumerCount = authUsers.filter((user) => user.role === 'USER').length
  const farmerCount = authUsers.filter((user) => user.role === 'FARMER').length
  const getUserProfile = (user) => (user.role === 'FARMER' ? farmerById.get(user.id) : profileById.get(user.id))
  const selectedAuthUser = authUsers.find((user) => user.id === selectedUserId) ?? null
  const selectedProfile =
    selectedAuthUser?.role === 'FARMER'
      ? farmerById.get(selectedUserId)
      : profileById.get(selectedUserId)
  const selectedImage = selectedProfile?.profileImageUrl || ''

  return (
    <>
      <section className="space-y-3">
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-extrabold text-emerald-950 sm:text-3xl">User Management</p>
          <p className="mt-1 text-sm text-emerald-700">Manage all platform users and farmers.</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              className="app-input h-9 w-full max-w-sm"
              placeholder="Search users, emails, roles..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            {roleFilters.map((filter) => (
              <button
                key={filter}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition sm:px-4 ${
                  roleFilter === filter
                    ? 'border-emerald-800 bg-emerald-800 text-white'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
                type="button"
                onClick={() => setRoleFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 divide-y divide-emerald-100 overflow-hidden rounded-xl border border-emerald-200 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
            <div className="bg-emerald-50/55 p-3 text-center">
              <p className="text-xl font-extrabold text-emerald-900 sm:text-2xl">{totalUsers}</p>
              <p className="text-xs text-emerald-700">Total Users</p>
            </div>
            <div className="bg-emerald-50/55 p-3 text-center">
              <p className="text-xl font-extrabold text-amber-500 sm:text-2xl">{adminCount}</p>
              <p className="text-xs text-emerald-700">Admins</p>
            </div>
            <div className="bg-emerald-50/55 p-3 text-center">
              <p className="text-xl font-extrabold text-emerald-600 sm:text-2xl">{consumerCount}</p>
              <p className="text-xs text-emerald-700">Consumers</p>
            </div>
            <div className="bg-emerald-50/55 p-3 text-center">
              <p className="text-xl font-extrabold text-emerald-600 sm:text-2xl">{farmerCount}</p>
              <p className="text-xs text-emerald-700">Farmers</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-xl font-bold text-emerald-950 sm:text-2xl">Manage Users</p>
              <p className="text-sm text-emerald-700">Remove users or farmers. Changes take effect immediately.</p>
            </div>
            <button className="app-button app-button-secondary h-9 px-4" type="button">
              Export CSV
            </button>
          </div>

          <div className="space-y-2 sm:hidden">
            {filteredUsers.map((user, index) => {
              const profile = getUserProfile(user)
              const protectedAccount = user.role === 'ADMIN' || user.id === auth.user.id
              return (
                <article key={user.id} className="rounded-xl border border-emerald-200 bg-white p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      {user.name?.trim()?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-emerald-950">{user.name}</p>
                      <p className="truncate text-xs text-emerald-700">{user.email}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                      {user.role}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-emerald-800">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-emerald-700">Phone</p>
                      <p className="mt-0.5 truncate">{profile?.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-emerald-700">Joined</p>
                      <p className="mt-0.5">{joinedLabels[index % joinedLabels.length]}</p>
                    </div>
                    <div className="col-span-2">
                      <span className={`app-status ${user.blocked ? 'app-status-danger' : ''}`}>
                        {user.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {protectedAccount ? (
                      <button className="app-button app-button-secondary h-8 px-2.5 text-xs" type="button" disabled>
                        Protected
                      </button>
                    ) : (
                      <button
                        className="app-button app-button-danger h-8 px-2.5 text-xs"
                        type="button"
                        onClick={() => onDeleteUser(user.id)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    )}
                    <button
                      className="app-button app-button-secondary h-8 px-2.5 text-xs"
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      View
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="app-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const profile = getUserProfile(user)
                  const protectedAccount = user.role === 'ADMIN' || user.id === auth.user.id
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                            {user.name?.trim()?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-emerald-950">{user.name}</p>
                            <p className="text-xs text-emerald-700">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {user.role}
                        </span>
                      </td>
                      <td>{profile?.phone || '-'}</td>
                      <td>
                        <span className={`app-status ${user.blocked ? 'app-status-danger' : ''}`}>
                          {user.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>{joinedLabels[index % joinedLabels.length]}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {protectedAccount ? (
                            <button className="app-button app-button-secondary h-8 px-3 text-xs" type="button" disabled>
                              Protected
                            </button>
                          ) : (
                            <button
                              className="app-button app-button-danger h-8 px-3 text-xs"
                              type="button"
                              onClick={() => onDeleteUser(user.id)}
                              disabled={loading}
                            >
                              Remove
                            </button>
                          )}
                          <button
                            className="app-button app-button-secondary h-8 px-3 text-xs"
                            type="button"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-emerald-700">Showing {filteredUsers.length} users</p>
        </div>
      </section>

      {selectedAuthUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/35 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {selectedImage ? (
                  <img
                    className="h-12 w-12 rounded-full border border-emerald-200 object-cover object-[center_40%] sm:h-14 sm:w-14"
                    src={selectedImage}
                    alt={selectedAuthUser.name}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white sm:h-14 sm:w-14 sm:text-lg">
                    {selectedAuthUser.name?.trim()?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-emerald-950 sm:text-xl">{selectedAuthUser.name}</p>
                  <p className="text-sm text-emerald-700">{selectedAuthUser.email}</p>
                </div>
              </div>
              <button
                className="app-button app-button-secondary h-8 px-3 text-xs"
                type="button"
                onClick={() => setSelectedUserId(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ProfileRow label="Role" value={selectedAuthUser.role} />
              <ProfileRow label="Status" value={selectedAuthUser.blocked ? 'Blocked' : 'Active'} />
              <ProfileRow label="Phone" value={selectedProfile?.phone} />
              <ProfileRow label="Address / Location" value={selectedProfile?.address || selectedProfile?.location} />
              <ProfileRow label="Farm Name" value={selectedProfile?.farmName} />
              <ProfileRow label="Specialty" value={selectedProfile?.specialty} />
              <ProfileRow label="Products" value={selectedProfile?.products?.length?.toString()} />
              <ProfileRow label="Total Orders" value={selectedProfile?.totalOrders?.toString()} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UsersPage
