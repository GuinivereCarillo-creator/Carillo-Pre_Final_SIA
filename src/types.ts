export type Burger = {
  id: string
  name: string
  price: number
  desc: string
  rating: number
  image: string
  stock: number
  featured: boolean
  dateAdded: string
}

export type CartItem = {
  burger: Burger
  qty: number
}

export type SortKey =
  | 'date-desc'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'stock-asc'
  | 'rating-desc'
