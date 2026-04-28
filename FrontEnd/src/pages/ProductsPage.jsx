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
    'w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-lg text-emerald-950 placeholder:text-emerald-500 outline-none transition focus:border-emerald-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/15 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-emerald-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-3xl font-semibold text-emerald-950">{productForm.id ? 'Update product' : 'Add product'}</p>
          <button className="app-button app-button-secondary h-9 px-3 text-sm" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={onSubmitProduct}>
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
                  <img src={productForm.imageUrl} alt="Product preview" className="h-40 w-full rounded-xl object-cover" />
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
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-base font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  onClick={() => openImagePicker(false, auth.token, onEditProduct)}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-base font-semibold text-emerald-700 transition hover:bg-emerald-100"
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
              className={`${darkInputClass} min-h-36 resize-y py-4`}
              value={productForm.description}
              onChange={(event) => onEditProduct((current) => ({ ...current, description: event.target.value }))}
              placeholder="Short product description..."
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-700 text-lg font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {productForm.id ? 'Save Product' : 'Add product'}
            </button>
            <button
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-emerald-200 bg-white text-lg font-semibold text-emerald-700 transition hover:bg-emerald-50"
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
      <section className="rounded-3xl border border-emerald-200 bg-white/85 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold text-emerald-950">Inventory</p>
            <p className="text-sm text-emerald-700">All products listed by you.</p>
          </div>
          <button
            className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
            type="button"
            onClick={handleAddItem}
          >
            + Add Item
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
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
      <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
        <p className="text-4xl font-bold leading-tight text-emerald-950">Products</p>
        <p className="mt-1 text-base text-emerald-700">Browse by category and add to cart.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`inline-flex h-10 items-center rounded-full border px-5 text-base font-semibold transition ${
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
              className={`inline-flex h-10 items-center rounded-full border px-5 text-base font-semibold transition ${
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
        <div key={group.key} className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-4xl font-semibold leading-tight text-emerald-950">{group.label}</p>
            <span className="text-lg font-medium text-emerald-700">{group.items.length} items</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <button className="w-full text-left" type="button" onClick={() => setSelectedProduct(product)}>
                  <ProductImage product={product} className="h-56 w-full rounded-none" />
                </button>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="break-words text-2xl font-semibold leading-tight text-emerald-950 sm:text-3xl">{product.name}</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">Rs. {Number(product.price).toFixed(2)}</p>
                    <p className="mt-1 text-xl font-medium text-emerald-700">{product.quantity} available</p>
                  </div>

                  {Number(product.quantity) <= 0 ? (
                    <button className="app-button app-button-secondary h-12 w-full text-lg" type="button" disabled>
                      Out of stock
                    </button>
                  ) : cart[product.id] > 0 ? (
                    <div className="grid h-12 w-full grid-cols-[56px_1fr_56px] overflow-hidden rounded-2xl border border-emerald-200">
                      <button
                        className="inline-flex h-full items-center justify-center bg-emerald-50 text-3xl font-semibold text-emerald-700 transition hover:bg-emerald-100"
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
                        className="w-full border-x border-emerald-200 bg-white px-1 text-center text-lg font-semibold text-emerald-950 outline-none"
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
                        className="inline-flex h-full items-center justify-center bg-emerald-50 text-3xl font-semibold text-emerald-700 transition hover:bg-emerald-100"
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
                      className="app-button app-button-secondary h-12 w-full text-xl"
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
