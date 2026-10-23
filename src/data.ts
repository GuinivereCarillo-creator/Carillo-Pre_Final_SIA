import type { Burger, SortKey } from './types'

const SEED_DATE = '2026-10-23T09:00:00'

export const burgers: Burger[] = [
  {
    id: 'crispy-chicken',
    name: 'Crispy Chicken',
    price: 99.15,
    desc: 'Chicken breast, chilli sauce, tomatoes, pickles, coleslaw',
    rating: 5,
    image: './burgers/crispy-chicken.jpg',
    stock: 18,
    featured: true,
    dateAdded: SEED_DATE,
  },
  {
    id: 'ultimate-bacon',
    name: 'Ultimate Bacon',
    price: 99.32,
    desc: 'House patty, cheddar cheese, bacon, onion, mustard',
    rating: 4.5,
    image: './burgers/ultimate-bacon.jpg',
    stock: 9,
    featured: false,
    dateAdded: SEED_DATE,
  },
  {
    id: 'black-sheep',
    name: 'Black Sheep',
    price: 69.15,
    desc: 'American cheese, tomato relish, avocado, lettuce, red onion',
    rating: 3.5,
    image: './burgers/black-sheep.jpg',
    stock: 12,
    featured: false,
    dateAdded: SEED_DATE,
  },
  {
    id: 'vegan-burger',
    name: 'Vegan Burger',
    price: 99.25,
    desc: 'House patty, cheddar cheese, bacon, onion, mustard',
    rating: 3,
    image: './burgers/vegan-burger.jpg',
    stock: 4,
    featured: false,
    dateAdded: SEED_DATE,
  },
  {
    id: 'double-trouble',
    name: 'Double Trouble',
    price: 120,
    desc: 'Two beef patties, double cheese, smoky sauce, crisp lettuce',
    rating: 5,
    image: './burgers/double-trouble.jpg',
    stock: 7,
    featured: true,
    dateAdded: SEED_DATE,
  },
  {
    id: 'cheese-overload',
    name: 'Cheese Overload',
    price: 110.5,
    desc: 'Triple cheddar, mozzarella, house sauce, toasted bun',
    rating: 4.5,
    image: './burgers/cheese-overload.jpg',
    stock: 15,
    featured: true,
    dateAdded: SEED_DATE,
  },
  {
    id: 'spicy-inferno',
    name: 'Spicy Inferno',
    price: 105.75,
    desc: 'Flame grilled patty, jalapenos, hot sauce, pepper jack',
    rating: 4,
    image: './burgers/spicy-inferno.jpg',
    stock: 5,
    featured: false,
    dateAdded: SEED_DATE,
  },
  {
    id: 'classic-beef',
    name: 'Classic Beef',
    price: 89.99,
    desc: 'All beef patty, pickles, tomato, onion, house dressing',
    rating: 4,
    image: './burgers/classic-beef.jpg',
    stock: 20,
    featured: false,
    dateAdded: SEED_DATE,
  },
]

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'date-desc', label: 'Date added (newest)' },
  { value: 'price-asc', label: 'Price (low to high)' },
  { value: 'price-desc', label: 'Price (high to low)' },
  { value: 'name-asc', label: 'Name (A to Z)' },
  { value: 'stock-asc', label: 'Stock (low to high)' },
  { value: 'rating-desc', label: 'Rating (high to low)' },
]

export const sortBurgers = (list: Burger[], key: SortKey): Burger[] => {
  const sorted = [...list]
  switch (key) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'stock-asc':
      return sorted.sort((a, b) => a.stock - b.stock)
    case 'rating-desc':
      return sorted.sort((a, b) => b.rating - a.rating)
    default:
      return sorted.sort(
        (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      )
  }
}
