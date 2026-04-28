import { useState } from 'react'
import { categoryConfig } from '../app/constants.js'
import ProductImage from '../components/common/ProductImage.jsx'
import { farmConnectService } from '../services/farmConnectService.js'

async function setImageFromFile(file, token, onEditProduct) {
  if (!file) return
  try {
    const response = await farmConnectService.uploadImage(file, token)
    const imageUrl = response?.url ?? response?.imageUrl ?? response
    if (typeof imageUrl === 'string' && imageUrl.trim()) {
      onEditProduct((current) => ({ ...current, imageUrl }))
      return
    }
    throw new Error('Invalid upload response')
  } catch {
    const reader = new FileReader()
    reader.onload = (event) => {
      onEditProduct((current) => ({ ...current, imageUrl: event.target?.result ?? '' }))
    }
    reader.readAsDataURL(file)
  }
}

function openImagePicker(useCamera, token, onEditProduct) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  if (useCamera) input.capture = 'environment'
  input.onchange = async (event) => {
    await setImageFromFile(event.target.files?.[0], token, onEditProduct)
  }
  input.click()
}

function InventoryEditorModal({
  auth,
  loading,
  productForm,
  onEditProduct,
  onSubmitProduct,
  onResetProduct,
  onClose,
}) {
  const darkInputClass =
    'w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-500 outline-none transition focus:border-emerald-400 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-emerald-900/15 p-2 sm:items-center sm:p-4">
      <div className="my-2 max-h-[calc(100vh-16px)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-emerald-200 bg-white p-3 shadow-2xl sm:my-0 sm:max-h-[calc(100vh-40px)] sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-2xl font-semibold text-emerald-950 sm:text-3xl">{productForm.id ? 'Update product' : 'Add product'}</p>
          <button className="app-button app-button-secondary h-9 px-3 text-sm" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="mt-4 space-y-3 sm:mt-5 sm:space-y-4" onSubmit={onSubmitProduct}>
          <label className="block text-sm font-semibold text-emerald-800">
            Product name
            <input
              className={darkInputClass}
              value={productForm.name}
              onChange={(event) => onEditProduct((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Fresh Tomatoes"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-emerald-800">
              Price (Rs.)
              <input
                className={darkInputClass}
                type="number"
                min="0"
                value={productForm.price}
                onChange={(event) => onEditProduct((current) => ({ ...current, price: event.target.value }))}
              />
            </label>
            <label className="block text-sm font-semibold text-emerald-800">
              Stock (qty)
              <input
                className={darkInputClass}
                type="number"
                min="0"
                value={productForm.quantity}
                onChange={(event) => onEditProduct((current) => ({ ...current, quantity: event.target.value }))}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-emerald-800">
            Product image
            <div className="mt-2 space-y-3">
              {productForm.imageUrl && (
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-2">
                  <img src={productForm.imageUrl} alt="Product preview" className="h-32 w-full rounded-xl object-cover sm:h-40" />
                  <button
                    type="button"
                    className="absolute top-4 right-4 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                    onClick={() => onEditProduct((current) => ({ ...current, imageUrl: '' }))}
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:h-11 sm:rounded-2xl sm:text-base"
                  onClick={() => openImagePicker(false, auth.token, onEditProduct)}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:h-11 sm:rounded-2xl sm:text-base"
                  onClick={() => openImagePicker(true, auth.token, onEditProduct)}
                >
                  Camera
                </button>
              </div>

              <input
                className={darkInputClass}
                placeholder="https://example.com/image.jpg"
                value={productForm.imageUrl?.startsWith('data:') ? '' : productForm.imageUrl ?? ''}
                onChange={(event) => onEditProduct((current) => ({ ...current, imageUrl: event.target.value }))}
              />
            </div>
          </label>

          <label className="block text-sm font-semibold text-emerald-800">
            Description
            <textarea
              className={`${darkInputClass} min-h-28 resize-y py-3 sm:min-h-36 sm:py-4`}
              value={productForm.description}
              onChange={(event) => onEditProduct((current) => ({ ...current, description: event.target.value }))}
              placeholder="Short product description..."
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-emerald-700 text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:rounded-2xl sm:text-lg"
              type="submit"
              disabled={loading}
            >
              {productForm.id ? 'Save Product' : 'Add product'}
            </button>
            <button
              className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-white text-base font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:h-12 sm:rounded-2xl sm:text-lg"
              type="button"
              onClick={onResetProduct}
            >
              {productForm.id ? 'Cancel Edit' : 'Reset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FarmerInventory({
  auth,
  products,
  loading,
  productForm,
  onEditProduct,
  onDeleteProduct,
  onSubmitProduct,
  onResetProduct,
}) {
  const [showEditor, setShowEditor] = useState(false)

  const handleAddItem = () => {
    onResetProduct()
    setShowEditor(true)
  }

  const handleEditItem = (product) => {
    onEditProduct({
      ...product,
      price: product.price ?? '',
      quantity: product.quantity ?? '',
      imageUrl: product.imageUrl ?? '',
    })
    setShowEditor(true)
  }

  return (
    <>
      <section className="rounded-2xl border border-emerald-200 bg-white/85 p-3 shadow-sm sm:rounded-3xl sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold text-emerald-950 sm:text-3xl">Inventory</p>
            <p className="text-sm text-emerald-700">All products listed by you.</p>
          </div>
          <button
            className="inline-flex h-8 items-center justify-center rounded-full bg-emerald-700 px-3 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:h-9 sm:px-4 sm:text-sm"
            type="button"
            onClick={handleAddItem}
          >
            + Add Item
          </button>
        </div>

        <div className="mt-3 space-y-2 sm:hidden">
          {products.map((product) => (
            <article key={product.id} className="rounded-xl border border-emerald-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-emerald-950">{product.name}</p>
                  <p className="mt-0.5 text-xs text-emerald-700">Rs. {Number(product.price).toFixed(2)}</p>
                  <p className="text-xs text-emerald-700">Stock: {product.quantity}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    className="app-button app-button-secondary h-8 px-2.5 text-xs"
                    type="button"
                    onClick={() => handleEditItem(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="app-button app-button-danger h-8 px-2.5 text-xs"
                    type="button"
                    onClick={() => onDeleteProduct(product.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!products.length && <p className="mt-1 text-sm text-emerald-700">No products yet. Click Add Item to create one.</p>}
        </div>

        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className="app-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="font-semibold">{product.name}</td>
                  <td>Rs. {Number(product.price).toFixed(2)}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="app-button app-button-secondary h-8 px-3 text-xs"
                        type="button"
                        onClick={() => handleEditItem(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="app-button app-button-danger h-8 px-3 text-xs"
                        type="button"
                        onClick={() => onDeleteProduct(product.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && <p className="mt-4 text-sm text-emerald-700">No products yet. Click Add Item to create one.</p>}
        </div>
      </section>

      {showEditor && (
        <InventoryEditorModal
          auth={auth}
          loading={loading}
          productForm={productForm}
          onEditProduct={onEditProduct}
          onSubmitProduct={onSubmitProduct}
          onResetProduct={onResetProduct}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  )
}

function ShopperProducts({
  groupedProducts,
  activeCategory,
  setActiveCategory,
  cart,
  onCartChange,
  setSelectedProduct,
}) {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
        <p className="text-2xl font-bold leading-tight text-emerald-950 sm:text-4xl">Products</p>
        <p className="mt-1 text-sm text-emerald-700 sm:text-base">Browse by category and add to cart.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-semibold transition sm:h-10 sm:px-5 sm:text-base ${
              activeCategory === 'all'
                ? 'border-emerald-700 bg-emerald-700 text-white'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            }`}
            type="button"
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {Object.entries(categoryConfig).map(([key, item]) => (
            <button
              key={key}
              className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-semibold transition sm:h-10 sm:px-5 sm:text-base ${
                activeCategory === key
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
              type="button"
              onClick={() => setActiveCategory(key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {groupedProducts.map((group) => (
        <div key={group.key} className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-2xl font-semibold leading-tight text-emerald-950 sm:text-4xl">{group.label}</p>
            <span className="text-sm font-medium text-emerald-700 sm:text-lg">{group.items.length} items</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm transition hover:shadow-md sm:rounded-3xl"
              >
                <button className="w-full text-left" type="button" onClick={() => setSelectedProduct(product)}>
                  <ProductImage product={product} className="h-44 w-full rounded-none sm:h-56" />
                </button>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="break-words text-xl font-semibold leading-tight text-emerald-950 sm:text-3xl">{product.name}</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-700 sm:text-3xl">Rs. {Number(product.price).toFixed(2)}</p>
                    <p className="mt-1 text-base font-medium text-emerald-700 sm:text-xl">{product.quantity} available</p>
                  </div>

                  {Number(product.quantity) <= 0 ? (
                    <button className="app-button app-button-secondary h-10 w-full text-base sm:h-12 sm:text-lg" type="button" disabled>
                      Out of stock
                    </button>
                  ) : cart[product.id] > 0 ? (
                    <div className="grid h-10 w-full grid-cols-[44px_1fr_44px] overflow-hidden rounded-xl border border-emerald-200 sm:h-12 sm:grid-cols-[56px_1fr_56px] sm:rounded-2xl">
                      <button
                        className="inline-flex h-full items-center justify-center bg-emerald-50 text-2xl font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-3xl"
                        type="button"
                        onClick={() => {
                          const currentValue = cart[product.id] || 0
                          if (currentValue > 0) {
                            onCartChange((current) => ({ ...current, [product.id]: currentValue - 1 }))
                          }
                        }}
                        disabled={!cart[product.id] || cart[product.id] === 0}
                      >
                        -
                      </button>
                      <input
                        className="w-full border-x border-emerald-200 bg-white px-1 text-center text-base font-semibold text-emerald-950 outline-none sm:text-lg"
                        type="number"
                        min="0"
                        max={product.quantity}
                        value={cart[product.id] ?? ''}
                        onChange={(event) => {
                          const value = Math.max(0, Math.min(product.quantity, parseInt(event.target.value, 10) || 0))
                          onCartChange((current) => ({ ...current, [product.id]: value }))
                        }}
                      />
                      <button
                        className="inline-flex h-full items-center justify-center bg-emerald-50 text-2xl font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-3xl"
                        type="button"
                        onClick={() => {
                          const currentValue = cart[product.id] || 0
                          if (currentValue < product.quantity) {
                            onCartChange((current) => ({ ...current, [product.id]: currentValue + 1 }))
                          }
                        }}
                        disabled={cart[product.id] >= product.quantity}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      className="app-button app-button-secondary h-10 w-full text-base sm:h-12 sm:text-xl"
                      type="button"
                      onClick={() => onCartChange((current) => ({ ...current, [product.id]: 1 }))}
                    >
                      Add to cart
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

function ProductsPage(props) {
  const {
    auth,
    products,
    groupedProducts,
    activeCategory,
    setActiveCategory,
    cart,
    loading,
    productForm,
    onCartChange,
    onEditProduct,
    onDeleteProduct,
    onSubmitProduct,
    onResetProduct,
    setSelectedProduct,
  } = props

  if (auth.user.role === 'FARMER') {
    return (
      <FarmerInventory
        auth={auth}
        products={products}
        loading={loading}
        productForm={productForm}
        onEditProduct={onEditProduct}
        onDeleteProduct={onDeleteProduct}
        onSubmitProduct={onSubmitProduct}
        onResetProduct={onResetProduct}
      />
    )
  }

  return (
    <ShopperProducts
      groupedProducts={groupedProducts}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      cart={cart}
      onCartChange={onCartChange}
      setSelectedProduct={setSelectedProduct}
    />
  )
}

export default ProductsPage
