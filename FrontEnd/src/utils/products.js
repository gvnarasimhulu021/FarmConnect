import { categoryConfig } from '../app/constants.js'

export function enrichProduct(product) {
  const source = `${product.name ?? ''} ${product.description ?? ''}`.toLowerCase()

  let category = 'dairy'
  if (/(tomato|spinach|chilli|potato|onion|okra|brinjal|cabbage|cauliflower|carrot|beetroot|capsicum|broccoli|cucumber|pumpkin|radish|peas|beans|garlic|ginger|leaf|vegetable)/.test(source)) {
    category = 'vegetables'
  } else if (/(mango|banana|apple|orange|papaya|grape|guava|fruit|pineapple|pomegranate|watermelon|muskmelon|sapota|pear)/.test(source)) {
    category = 'fruits'
  } else if (/(rice|wheat|millet|grain|dal|lentil|maize|corn|oats|barley|quinoa|flour)/.test(source)) {
    category = 'grains'
  }

  return {
    ...product,
    category,
    categoryLabel: categoryConfig[category].label,
  }
}
