import type { Burger } from '../types'
import { addedOn, lowStock, money } from '../format'
import { primaryButton } from '../styles'
import Stars from './Stars'

type ProductPageProps = {
  burger: Burger
  onAdd: (burger: Burger) => void
}

export default function ProductPage({ burger, onAdd }: ProductPageProps) {
  return (
    <div className="min-h-screen bg-linear-to-l from-[#cf42eb] from-10% to-[#ec4b66] pb-[60px]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b-[3px] border-[#f0e6dc] bg-white px-10 py-4 max-sm:flex-col max-sm:gap-2.5 max-sm:px-4 max-sm:py-3.5">
        <div className="flex items-center gap-2.5 select-none">
          <span className="text-[34px] leading-none">&#127828;</span>
          <span className="flex flex-col leading-none">
            <small className="text-[13px] font-bold tracking-[3px] text-gold">TASTY</small>
            <strong className="text-[26px] tracking-wide text-tangerine">BURGER</strong>
          </span>
        </div>
        <nav className="flex items-center gap-1.5">
          <a
            className="border-b-2 border-brand px-0.5 py-1 text-sm font-bold text-brand transition hover:border-brand-dark hover:text-brand-dark"
            href="#"
          >
            Back to menu
          </a>
        </nav>
      </header>

      <div className="mx-auto max-w-[900px] px-6 pt-10 pb-[70px]">
        <div className="flex overflow-hidden rounded-[14px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.18)] max-lg:flex-col">
          <img
            className="w-[48%] object-cover max-lg:h-[300px] max-lg:w-full"
            src={burger.image}
            alt={burger.name}
          />
          <div className="flex-1 p-8">
            <span className="mb-3 inline-block rounded-full bg-[#f7ead9] px-2.5 py-1 text-[11px] font-bold tracking-[1px] text-cocoa">
              Added {addedOn(burger.dateAdded)}
            </span>
            <h1 className="mt-0 mb-2 text-[32px] font-bold text-[#2b2b2b]">{burger.name}</h1>
            <Stars value={burger.rating} />
            <p className="leading-relaxed text-[#7c7c7c]">{burger.desc}</p>
            <span className="mt-2 mb-2 inline-block text-[26px] font-extrabold text-cocoa">
              {money(burger.price)}
            </span>
            <span
              className={
                lowStock(burger.stock)
                  ? 'mb-[18px] block text-xs font-bold text-brand'
                  : 'mb-[18px] block text-xs font-bold text-[#7c7c7c]'
              }
            >
              {lowStock(burger.stock) ? 'Low stock' : 'In stock'} &#183; {burger.stock} left
            </span>
            <div className="mt-[22px] flex items-center gap-4">
              <button className={primaryButton} onClick={() => onAdd(burger)}>
                Add to order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
