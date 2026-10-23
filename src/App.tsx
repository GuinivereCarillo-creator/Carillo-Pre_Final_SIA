import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from 'react'
import AddBurgerSheet from './components/AddBurgerSheet'
import ProductPage from './components/ProductPage'
import Stars from './components/Stars'
import { burgers as seedBurgers, sortBurgers, sortOptions } from './data'
import { addedOn, lowStock, money } from './format'
import {
  fieldInput,
  fieldLabel,
  navButton,
  navButtonActive,
  navButtonIdle,
  primaryButton,
  stepperButton,
} from './styles'
import type { Burger, CartItem, SortKey } from './types'

const BURGER_KEY = 'tasty_burger_menu'
const CART_KEY = 'tasty_burger_cart'

type Page = 'menu' | 'about' | 'feature' | 'shop' | 'contact'

const loadBurgers = (): Burger[] => {
  try {
    const saved = localStorage.getItem(BURGER_KEY)
    if (!saved) return seedBurgers
    const parsed = JSON.parse(saved) as Burger[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedBurgers
  } catch {
    return seedBurgers
  }
}

const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const currentRoute = () => {
  const match = window.location.hash.match(/^#\/burger\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function App() {
  const [burgers, setBurgers] = useState<Burger[]>(loadBurgers)
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const [page, setPage] = useState<Page>('menu')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [showAll, setShowAll] = useState(false)
  const [likes, setLikes] = useState<string[]>([])
  const [active, setActive] = useState<Burger | null>(null)
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [routeId, setRouteId] = useState<string | null>(currentRoute)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    localStorage.setItem(BURGER_KEY, JSON.stringify(burgers))
  }, [burgers])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== CART_KEY || !event.newValue) return
      try {
        const parsed = JSON.parse(event.newValue) as CartItem[]
        if (Array.isArray(parsed)) setCart(parsed)
      } catch {
        setCart([])
      }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  useEffect(() => {
    const onHash = () => setRouteId(currentRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!note) return
    const timer = window.setTimeout(() => setNote(''), 2400)
    return () => window.clearTimeout(timer)
  }, [note])

  useEffect(() => {
    if (!highlight) return
    const timer = window.setTimeout(() => setHighlight(null), 6000)
    return () => window.clearTimeout(timer)
  }, [highlight])

  const sorted = useMemo(() => sortBurgers(burgers, sortKey), [burgers, sortKey])
  const visible = showAll ? sorted : sorted.slice(0, 4)
  const featured = burgers.filter((burger) => burger.featured)
  const count = cart.reduce((sum, item) => sum + item.qty, 0)
  const total = cart.reduce((sum, item) => sum + item.burger.price * item.qty, 0)

  const flash = (text: string) => setNote(text)

  const go = (target: Page) => {
    setPage(target)
    setActive(null)
  }

  const toggleLike = (id: string) => {
    setLikes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleFeatured = (id: string) => {
    setBurgers((prev) =>
      prev.map((burger) =>
        burger.id === id ? { ...burger, featured: !burger.featured } : burger,
      ),
    )
  }

  const addToCart = (burger: Burger, amount = 1) => {
    setCart((prev) => {
      const found = prev.find((item) => item.burger.id === burger.id)
      if (found) {
        return prev.map((item) =>
          item.burger.id === burger.id ? { ...item, qty: item.qty + amount } : item,
        )
      }
      return [...prev, { burger, qty: amount }]
    })
  }

  const openProduct = (burger: Burger) => {
    setActive(burger)
    setQty(1)
  }

  const placeOrder = () => {
    if (!active) return
    addToCart(active, qty)
    flash(qty + ' x ' + active.name + ' added to your order')
    setActive(null)
  }

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.burger.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    )
  }

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.burger.id !== id))
  }

  const submitForm = (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      flash('Please complete all fields')
      return
    }
    flash('Thanks ' + form.name + ', we received your message')
    setForm({ name: '', email: '', message: '' })
  }

  const saveBurger = (input: {
    name: string
    desc: string
    price: number
    stock: number
    rating: number
    image: string
    featured: boolean
  }) => {
    const burger: Burger = {
      id: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`,
      name: input.name.trim(),
      desc: input.desc.trim(),
      price: input.price,
      rating: input.rating,
      image: input.image,
      stock: input.stock,
      featured: input.featured,
      dateAdded: new Date().toISOString(),
    }
    setBurgers((prev) => [burger, ...prev])
    setSortKey('date-desc')
    setShowAll(true)
    setHighlight(burger.id)
    setAddOpen(false)
    flash(burger.name + ' is now on the menu')
    window.setTimeout(() => {
      document
        .getElementById(`card-${burger.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
    return burger
  }

  if (routeId) {
    const product = burgers.find((burger) => burger.id === routeId)
    if (!product) {
      return (
        <div className="min-h-screen bg-linear-to-l from-[#cf42eb] from-10% to-[#ec4b66] pb-[60px]">
          <div className="mx-auto max-w-[900px] px-6 pt-10 pb-[70px]">
            <a
              className="mb-[18px] inline-block border-b-2 border-white/60 pb-0.5 text-sm font-bold text-white transition hover:border-white"
              href="#"
            >
              Back to menu
            </a>
            <p className="rounded-[10px] bg-white px-6 py-10 text-center text-[#7c7c7c]">
              That burger is no longer on the menu.
            </p>
          </div>
        </div>
      )
    }
    return (
      <>
        <ProductPage
          burger={product}
          onAdd={(item) => {
            addToCart(item)
            flash(item.name + ' added to your order')
          }}
        />
        {note && (
          <div className="animate-fade fixed bottom-[26px] left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#2b2b2b] px-[22px] py-3 text-sm text-white">
            {note}
          </div>
        )}
      </>
    )
  }

  const menuPage = (
    <section className="mx-auto max-w-[1080px] px-6 py-10">
      <h1 className="mt-2.5 mb-3.5 text-center text-[40px] font-bold tracking-wide text-brand max-sm:text-3xl">
        OUR CRAZY BURGERS
      </h1>
      <h4 className="mb-2.5 text-center text-sm font-semibold tracking-wide text-white">
        Made by Guinivere Carillo
      </h4>
      <p className="mx-auto mb-10 max-w-[680px] text-center leading-relaxed text-[#faf9f9]">
        Get ready for a wild ride of flavors. Our crazy burgers are loaded with juicy patties,
        bold toppings, and irresistible sauces, all stacked on a perfectly toasted bun. Whether
        you like it cheesy, or extra meaty, we have got a burger that will blow your mind.
      </p>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5 rounded-[10px] bg-white/90 px-4 py-3">
        <span className="text-[13px] font-bold text-[#7c7c7c]">{sorted.length} burgers</span>
        <div className="flex items-center gap-2.5">
          <label className="text-[13px] font-bold text-[#3a3a3a]" htmlFor="sort">
            Sort by
          </label>
          <select
            className="cursor-pointer rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-[13px] text-[#2b2b2b] focus:border-tangerine focus:outline-none"
            id="sort"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[22px] max-lg:grid-cols-2 max-sm:grid-cols-1">
        {visible.map((burger) => (
          <article
            className={
              'animate-pop overflow-hidden rounded-[10px] border border-[#ececec] bg-white transition ' +
              (highlight === burger.id
                ? 'ring-[3px] ring-gold ring-offset-2'
                : 'hover:-translate-y-1.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)]')
            }
            key={burger.id}
            id={`card-${burger.id}`}
          >
            <div
              className="group/thumb relative h-[190px] cursor-pointer overflow-hidden bg-[#f2ece5]"
              onClick={() => openProduct(burger)}
            >
              <img
                className="block h-full w-full object-cover transition duration-400 group-hover/thumb:scale-[1.08]"
                src={burger.image}
                alt={burger.name}
              />
              {lowStock(burger.stock) && (
                <span className="absolute top-2.5 left-2.5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
                  Low stock
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-brand/85 py-2 text-center text-[13px] font-bold text-white transition group-hover/thumb:translate-y-0">
                View Product
              </span>
            </div>
            <div className="px-4 pt-3.5 pb-[18px]">
              <div className="flex items-center justify-between">
                <Stars value={burger.rating} />
                <div className="flex items-center gap-1">
                  <button
                    className={
                      burger.featured
                        ? 'scale-110 text-[19px] text-gold transition'
                        : 'text-[19px] text-[#c9c9c9] transition hover:text-gold'
                    }
                    onClick={() => toggleFeatured(burger.id)}
                    aria-label={burger.featured ? 'Remove from feature' : 'Add to feature'}
                    title={burger.featured ? 'Remove from feature' : 'Add to feature'}
                  >
                    &#9733;
                  </button>
                  <button
                    className={
                      likes.includes(burger.id)
                        ? 'scale-115 text-xl text-brand transition'
                        : 'text-xl text-[#b9b9b9] transition hover:text-brand'
                    }
                    onClick={() => toggleLike(burger.id)}
                    aria-label={likes.includes(burger.id) ? 'Unlike burger' : 'Like burger'}
                  >
                    {likes.includes(burger.id) ? '\u2665' : '\u2661'}
                  </button>
                </div>
              </div>
              <h3 className="mt-2 mb-1.5 text-[17px] font-bold">{burger.name}</h3>
              <p className="mb-2.5 min-h-10 text-[13px] leading-[1.5] text-[#7c7c7c]">
                {burger.desc}
              </p>
              <div className="mb-3 flex items-center gap-2 text-[11px] text-[#9a9a9a]">
                <span className={lowStock(burger.stock) ? 'font-bold text-brand' : ''}>
                  {burger.stock} in stock
                </span>
                <span>&#183;</span>
                <span>Added {addedOn(burger.dateAdded)}</span>
              </div>
              <span className="inline-block rounded bg-cocoa px-2.5 py-1 text-[13px] font-bold text-white">
                {money(burger.price)}
              </span>
            </div>
          </article>
        ))}
      </div>

      {sorted.length > 4 && (
        <button
          className="mx-auto mt-10 block border-b-2 border-[#2b2b2b] pb-0.5 text-base font-bold text-[#2b2b2b] transition hover:border-brand hover:text-brand"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : 'View More'}
        </button>
      )}
    </section>
  )

  const featurePage = (
    <section className="mx-auto max-w-[1080px] px-6 py-10">
      <h1 className="mt-2.5 mb-3.5 text-center text-[40px] font-bold tracking-wide text-brand max-sm:text-3xl">
        FEATURED BURGERS
      </h1>
      <p className="mx-auto mb-10 max-w-[680px] text-center leading-relaxed text-[#faf9f9]">
        Our best sellers, picked by the kitchen. Open any burger to see its own page.
      </p>
      {featured.length === 0 ? (
        <p className="rounded-[10px] bg-white px-6 py-10 text-center text-[#7c7c7c]">
          No featured burgers yet. Tap the star on a menu card to put it here.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-[22px] max-lg:grid-cols-2 max-sm:grid-cols-1">
          {featured.map((burger) => (
            <a
              className="animate-pop block overflow-hidden rounded-[10px] border border-[#ececec] bg-white text-inherit transition hover:-translate-y-1.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)]"
              key={burger.id}
              href={`#/burger/${burger.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="block h-[170px] w-full object-cover"
                src={burger.image}
                alt={burger.name}
              />
              <div className="px-3.5 pt-3 pb-4">
                <h3 className="mb-1.5 text-base font-bold">{burger.name}</h3>
                <span className="text-[13px] font-bold text-cocoa">{money(burger.price)}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )

  const aboutPage = (
    <section className="mx-auto max-w-[1080px] px-6 py-10">
      <h1 className="mt-2.5 mb-3.5 text-center text-[40px] font-bold tracking-wide text-brand max-sm:text-3xl">
        ABOUT US
      </h1>
      <p className="mx-auto mb-10 max-w-[680px] text-center leading-relaxed text-[#faf9f9]">
        Tasty Burger started as a small street stall with one goal, to serve honest burgers made
        from fresh ingredients every single day.
      </p>
      <div className="flex flex-col items-center gap-[26px] text-center">
        <div className="flex flex-wrap justify-center gap-[26px]">
          <div className="w-[200px] rounded-[10px] border border-[#ececec] bg-white px-3 py-[26px] text-center">
            <strong className="block text-[34px] text-brand">1</strong>
            <span className="text-sm text-black">Years grilling</span>
          </div>
          <div className="w-[200px] rounded-[10px] border border-[#ececec] bg-white px-3 py-[26px] text-center">
            <strong className="block text-[34px] text-brand">{burgers.length}</strong>
            <span className="text-sm text-black">Burger recipes</span>
          </div>
          <div className="w-[200px] rounded-[10px] border border-[#ececec] bg-white px-3 py-[26px] text-center">
            <strong className="block text-[34px] text-brand">1K</strong>
            <span className="text-sm text-black">Happy orders</span>
          </div>
        </div>
        <div className="rounded-[10px] bg-white px-[26px] py-[18px] text-left text-[#2b2b2b]">
          <p className="my-1.5 text-sm">
            Email: <strong>guinivere@gmail.com</strong>
          </p>
          <p className="my-1.5 text-sm">
            Contact number: <strong>09123456789</strong>
          </p>
        </div>
      </div>
    </section>
  )

  const shopPage = (
    <section className="mx-auto max-w-[1080px] px-6 py-10">
      <h1 className="mt-2.5 mb-3.5 text-center text-[40px] font-bold tracking-wide text-brand max-sm:text-3xl">
        YOUR ORDER
      </h1>
      {cart.length === 0 ? (
        <p className="rounded-[10px] bg-white px-6 py-10 text-center text-[#7c7c7c]">
          Your cart is empty.
        </p>
      ) : (
        <div className="mx-auto max-w-[720px] rounded-xl bg-white p-[18px]">
          {cart.map((item) => (
            <div
              className="mb-3 flex items-center gap-4 rounded-[10px] border border-[#ececec] p-3 max-sm:flex-wrap"
              key={item.burger.id}
            >
              <img
                className="h-[72px] w-[72px] rounded-lg object-cover"
                src={item.burger.image}
                alt={item.burger.name}
              />
              <div className="flex-1">
                <h3 className="mb-1 text-base font-bold">{item.burger.name}</h3>
                <span className="text-[13px] text-[#7c7c7c]">{money(item.burger.price)}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className={stepperButton}
                  onClick={() => changeQty(item.burger.id, -1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="min-w-6 text-center font-bold">{item.qty}</span>
                <button
                  className={stepperButton}
                  onClick={() => changeQty(item.burger.id, 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <div className="min-w-[90px] text-right font-bold">
                {money(item.burger.price * item.qty)}
              </div>
              <button
                className="rounded-md border border-[#e0b4b4] px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
                onClick={() => removeItem(item.burger.id)}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t-2 border-[#f0e6dc] px-1 py-4 text-lg">
            <span>Total</span>
            <strong className="text-brand">{money(total)}</strong>
          </div>
          <button
            className={primaryButton + ' block w-full'}
            onClick={() => {
              setCart([])
              flash('Order placed. Thank you!')
            }}
          >
            Checkout
          </button>
        </div>
      )}
    </section>
  )

  const contactPage = (
    <section className="mx-auto max-w-[1080px] px-6 py-10">
      <h1 className="mt-2.5 mb-3.5 text-center text-[40px] font-bold tracking-wide text-brand max-sm:text-3xl">
        CONTACT
      </h1>
      <p className="mx-auto mb-10 max-w-[680px] text-center leading-relaxed text-[#faf9f9]">
        Send us a message and we will get back to you shortly.
      </p>
      <form
        className="mx-auto flex max-w-[520px] flex-col gap-3.5 rounded-xl bg-white p-[22px]"
        onSubmit={submitForm}
      >
        <div>
          <label className={fieldLabel} htmlFor="contact-name">
            Name
          </label>
          <input
            className={fieldInput}
            id="contact-name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="contact-email">
            Email
          </label>
          <input
            className={fieldInput}
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="contact-message">
            Message
          </label>
          <textarea
            className={fieldInput + ' resize-y'}
            id="contact-message"
            rows={4}
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
          />
        </div>
        <button className={primaryButton} type="submit">
          Send Message
        </button>
      </form>
    </section>
  )

  const pages: Record<Page, ReactElement> = {
    menu: menuPage,
    about: aboutPage,
    feature: featurePage,
    shop: shopPage,
    contact: contactPage,
  }

  const navItems: { key: Page; label: string }[] = [
    { key: 'about', label: 'ABOUT' },
    { key: 'menu', label: 'OUR MENU' },
    { key: 'feature', label: 'FEATURE' },
    { key: 'shop', label: 'SHOP' },
    { key: 'contact', label: 'CONTACT' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-l from-[#cf42eb] from-10% to-[#ec4b66] pb-[60px]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b-[3px] border-[#f0e6dc] bg-white px-10 py-4 max-sm:flex-col max-sm:gap-2.5 max-sm:px-4 max-sm:py-3.5">
        <div
          className="flex cursor-pointer items-center gap-2.5 select-none"
          onClick={() => go('menu')}
        >
          <span className="text-[34px] leading-none">&#127828;</span>
          <span className="flex flex-col leading-none">
            <small className="text-[13px] font-bold tracking-[3px] text-gold">TASTY</small>
            <strong className="text-[26px] tracking-wide text-tangerine">BURGER</strong>
          </span>
        </div>
        <nav className="flex items-center gap-1.5 max-sm:flex-wrap max-sm:justify-center">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={
                navButton + ' ' + (page === item.key ? navButtonActive : navButtonIdle)
              }
              onClick={() => go(item.key)}
            >
              {item.label}
            </button>
          ))}
          <button
            className="relative text-xl"
            onClick={() => go('shop')}
            aria-label="Open cart"
          >
            &#128722;
            <span className="absolute top-0 right-0.5 rounded-[10px] bg-brand px-1.5 py-px text-[10px] font-bold text-white">
              {count}
            </span>
          </button>
        </nav>
      </header>

      {pages[page]}

      <button
        className="fixed right-[26px] bottom-[26px] z-30 flex items-center gap-2 rounded-[40px] bg-brand px-[22px] py-[15px] text-[15px] font-bold text-white shadow-[0_12px_26px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-brand-dark max-sm:right-4 max-sm:bottom-4 max-sm:px-[18px] max-sm:py-[13px] max-sm:text-sm"
        onClick={() => setAddOpen(true)}
      >
        <span>&#43;</span> Add Burger
      </button>

      <AddBurgerSheet open={addOpen} onClose={() => setAddOpen(false)} onSave={saveBurger} />

      {active && (
        <div
          className="animate-fade fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-5"
          onClick={() => setActive(null)}
        >
          <div
            className="animate-pop relative flex w-full max-w-[760px] overflow-hidden rounded-[14px] bg-white max-lg:flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute top-2.5 right-3.5 text-[26px] leading-none text-[#999] transition hover:text-brand"
              onClick={() => setActive(null)}
              aria-label="Close product"
            >
              &#215;
            </button>
            <img
              className="w-[46%] object-cover max-lg:h-[220px] max-lg:w-full"
              src={active.image}
              alt={active.name}
            />
            <div className="flex-1 p-7">
              <h2 className="mb-1.5 text-2xl font-bold">{active.name}</h2>
              <Stars value={active.rating} />
              <p className="leading-relaxed text-[#7c7c7c]">{active.desc}</p>
              <span className="mt-1.5 mb-2 inline-block text-[26px] font-extrabold text-cocoa">
                {money(active.price)}
              </span>
              <span
                className={
                  lowStock(active.stock)
                    ? 'mb-[18px] block text-xs font-bold text-brand'
                    : 'mb-[18px] block text-xs font-bold text-[#7c7c7c]'
                }
              >
                {lowStock(active.stock) ? 'Low stock' : 'In stock'} &#183; {active.stock} left
              </span>
              <div className="flex items-center gap-[18px]">
                <div className="flex items-center gap-3">
                  <button
                    className={stepperButton}
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="min-w-6 text-center font-bold">{qty}</span>
                  <button
                    className={stepperButton}
                    onClick={() => setQty(qty + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button className={primaryButton} onClick={placeOrder}>
                  Order {money(active.price * qty)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {note && (
        <div className="animate-fade fixed bottom-[26px] left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#2b2b2b] px-[22px] py-3 text-sm text-white">
          {note}
        </div>
      )}
    </div>
  )
}
