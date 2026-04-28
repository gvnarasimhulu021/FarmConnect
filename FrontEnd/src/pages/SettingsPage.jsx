import { farmConnectService } from '../services/farmConnectService.js'

function SettingsPage({ auth, profile, loading, farmConnect }) {
  if (!profile) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p className="text-xl font-bold text-emerald-950 sm:text-2xl">Profile</p>
        <p className="mt-2 text-sm text-emerald-700">Loading profile...</p>
      </section>
    )
  }

  const updateProfileImage = (profileImageUrl) => {
    farmConnect.setProfile((current) => ({ ...current, profileImageUrl }))
  }

  const handleProfileImageSelect = (captureMode = '') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    if (captureMode) {
      input.setAttribute('capture', captureMode)
    }
    input.onchange = async (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      try {
        const response = await farmConnectService.uploadImage(file, auth.token)
        const imageUrl = response?.url ?? response?.imageUrl ?? ''
        if (!imageUrl) {
          throw new Error('Upload response did not include a URL')
        }
        updateProfileImage(imageUrl)
      } catch {
        const reader = new FileReader()
        reader.onload = (e) => updateProfileImage(e.target?.result ?? '')
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const inputClass =
    'app-input !h-10 sm:!h-11 !rounded-xl sm:!rounded-3xl !border-emerald-200 !bg-white !px-3 sm:!px-4 !text-sm !font-medium !text-emerald-950 placeholder:!text-emerald-500 [color-scheme:light] dark:!bg-white dark:!text-emerald-950'
  const labelClass = 'block text-sm font-medium text-emerald-900'

  return (
    <section className="grid gap-3 sm:gap-4 xl:grid-cols-[360px_minmax(0,1fr)]" style={{ colorScheme: 'only light' }}>
      <aside className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-base uppercase tracking-[0.14em] text-emerald-700">Profile Card</p>
        <div className="mt-4 flex flex-col items-center text-center">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt="Profile"
              className="h-24 w-24 rounded-full border border-emerald-200 object-cover object-[center_40%] shadow-sm sm:h-32 sm:w-32"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white sm:h-32 sm:w-32 sm:text-4xl">
              {profile.name?.trim()?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <p className="mt-4 text-2xl font-semibold leading-tight text-emerald-950 sm:text-3xl">{profile.name || 'Profile'}</p>
          <p className="break-all text-sm text-emerald-700 sm:text-lg">{profile.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 sm:px-4 sm:text-sm">
            {auth.user.role}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:mt-8 sm:rounded-3xl sm:p-5">
          <p className="text-sm uppercase tracking-[0.14em] text-emerald-700">Session</p>
          <p className="mt-3 text-base text-emerald-900 sm:text-lg">Logged in as {auth.user.name}</p>
          <button className="app-button app-button-secondary mt-4 h-9 w-full text-sm sm:mt-5 sm:h-10" type="button" onClick={farmConnect.signOut}>
            Logout
          </button>
        </div>
      </aside>

      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-2xl font-semibold leading-tight text-emerald-950 sm:text-3xl">Profile Settings</p>
        <p className="mt-1 text-sm text-emerald-700 sm:text-lg">Update your personal details and profile photo.</p>

        <form className="mt-5 space-y-4 sm:mt-6 sm:space-y-5" onSubmit={farmConnect.saveProfile}>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:rounded-3xl sm:p-5">
            <label className={labelClass}>
              Profile Photo
              <div className="mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:max-w-[560px]">
                  <button
                    className="app-button app-button-secondary !h-9 sm:!h-10 !rounded-xl sm:!rounded-2xl !text-sm"
                    type="button"
                    onClick={() => handleProfileImageSelect()}
                  >
                    Upload
                  </button>
                  <button
                    className="app-button app-button-secondary !h-9 sm:!h-10 !rounded-xl sm:!rounded-2xl !text-sm"
                    type="button"
                    onClick={() => handleProfileImageSelect('environment')}
                  >
                    Camera
                  </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="https://example.com/profile.jpg or /api/upload/files/..."
                  value={profile.profileImageUrl?.startsWith('data:') ? '' : profile.profileImageUrl ?? ''}
                  onChange={(event) => updateProfileImage(event.target.value)}
                />
              </div>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Name
              <input
                className={inputClass}
                value={profile.name ?? ''}
                onChange={(event) => farmConnect.setProfile((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className={labelClass}>
              Email
              <input
                className={inputClass}
                type="email"
                value={profile.email ?? ''}
                onChange={(event) => farmConnect.setProfile((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Phone
              <input
                className={inputClass}
                value={profile.phone ?? ''}
                onChange={(event) => farmConnect.setProfile((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>

            {auth.user.role === 'FARMER' ? (
              <label className={labelClass}>
                Farm name
                <input
                  className={inputClass}
                  value={profile.farmName ?? ''}
                  onChange={(event) => farmConnect.setProfile((current) => ({ ...current, farmName: event.target.value }))}
                />
              </label>
            ) : (
              <label className={labelClass}>
                Address
                <input
                  className={inputClass}
                  value={profile.address ?? ''}
                  onChange={(event) => farmConnect.setProfile((current) => ({ ...current, address: event.target.value }))}
                />
              </label>
            )}
          </div>

          {auth.user.role === 'FARMER' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Location
                <input
                  className={inputClass}
                  value={profile.location ?? ''}
                  onChange={(event) => farmConnect.setProfile((current) => ({ ...current, location: event.target.value }))}
                />
              </label>
              <label className={labelClass}>
                Specialty
                <input
                  className={inputClass}
                  value={profile.specialty ?? ''}
                  onChange={(event) => farmConnect.setProfile((current) => ({ ...current, specialty: event.target.value }))}
                />
              </label>
            </div>
          )}

          <button className="app-button app-button-primary h-9 px-5 text-sm sm:h-10 sm:px-6 sm:text-base" type="submit" disabled={loading}>
            Save Profile
          </button>
        </form>
      </div>
    </section>
  )
}

export default SettingsPage
