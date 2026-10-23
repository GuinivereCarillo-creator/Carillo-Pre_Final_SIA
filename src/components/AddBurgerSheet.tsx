import { useEffect, useRef, useState, type FormEvent } from 'react'
import { readImage } from '../readImage'
import { money } from '../format'
import { fieldInput, fieldLabel, primaryButton } from '../styles'
import type { Burger } from '../types'

type NewBurger = {
  name: string
  desc: string
  price: number
  stock: number
  rating: number
  image: string
  featured: boolean
}

type AddBurgerSheetProps = {
  open: boolean
  onClose: () => void
  onSave: (burger: NewBurger) => Burger
}

type FormState = {
  name: string
  desc: string
  price: string
  stock: string
  rating: string
  image: string
  featured: boolean
}

const empty: FormState = {
  name: '',
  desc: '',
  price: '',
  stock: '',
  rating: '5',
  image: '',
  featured: false,
}

export default function AddBurgerSheet({ open, onClose, onSave }: AddBurgerSheetProps) {
  const [form, setForm] = useState<FormState>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setForm(empty)
      setErrors({})
    }
  }, [open])

  if (!open) return null

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Choose an image file.' }))
      return
    }
    setLoading(true)
    try {
      set('image', await readImage(file))
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        image: error instanceof Error ? error.message : 'Could not load that image.',
      }))
    } finally {
      setLoading(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const price = Number(form.price)
    const stock = Number(form.stock)
    const rating = Number(form.rating)
    const next: Record<string, string> = {}

    if (!form.image) next.image = 'Burger photo is required.'
    if (!form.name.trim()) next.name = 'Burger name is required.'
    if (!form.desc.trim()) next.desc = 'Description is required.'
    if (!form.price || Number.isNaN(price) || price <= 0) next.price = 'Enter a price in pesos.'
    if (form.stock === '' || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock))
      next.stock = 'Enter a whole stock count.'
    if (Number.isNaN(rating) || rating < 1 || rating > 5) next.rating = 'Rating must be 1 to 5.'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    onSave({
      name: form.name,
      desc: form.desc,
      price,
      stock,
      rating,
      image: form.image,
      featured: form.featured,
    })
  }

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(30,10,25,0.45)] p-5 backdrop-blur-[8px]"
      role="dialog"
      aria-modal="true"
      aria-label="Add a burger"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        className="animate-pop relative my-[30px] max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-[14px] bg-white p-[26px]"
        onSubmit={submit}
      >
        <button
          type="button"
          className="absolute top-3 right-3.5 text-[26px] leading-none text-[#999] transition hover:text-brand"
          onClick={onClose}
          aria-label="Close form"
        >
          &#215;
        </button>
        <h2 className="mb-1 text-2xl font-bold text-brand">Add New Burger</h2>
        <p className="mb-[18px] text-[13px] text-[#7c7c7c]">
          Fill in the details and it will show up in the menu.
        </p>

        <div className="mb-3.5">
          <label className={fieldLabel} htmlFor="burger-photo">
            Burger photo
          </label>
          <div className="flex items-center gap-3.5">
            <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-[#d6c7bb] bg-[#faf5f0] text-[26px]">
              {form.image ? (
                <img className="h-full w-full object-cover" src={form.image} alt="Burger preview" />
              ) : (
                <span>&#127828;</span>
              )}
            </div>
            <div>
              <input
                id="burger-photo"
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => pickFile(event.target.files?.[0])}
              />
              <button
                type="button"
                className="rounded-lg border border-[#f0cfc0] bg-cream px-4 py-2.5 text-[13px] font-bold text-brand transition hover:bg-[#fbe3d8]"
                onClick={() => fileRef.current?.click()}
              >
                {loading ? 'Loading photo' : form.image ? 'Change photo' : 'Upload photo'}
              </button>
              <p className="mt-1.5 text-[11px] text-[#9a9a9a]">JPG or PNG, saved to this device.</p>
              {errors.image && (
                <p className="mt-1.5 text-xs font-semibold text-brand">{errors.image}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3.5">
          <label className={fieldLabel} htmlFor="burger-name">
            Burger name
          </label>
          <input
            className={fieldInput}
            id="burger-name"
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs font-semibold text-brand">{errors.name}</p>
          )}
        </div>

        <div className="mb-3.5">
          <label className={fieldLabel} htmlFor="burger-desc">
            Description
          </label>
          <textarea
            className={fieldInput + ' resize-y'}
            id="burger-desc"
            rows={3}
            value={form.desc}
            onChange={(event) => set('desc', event.target.value)}
          />
          {errors.desc && (
            <p className="mt-1.5 text-xs font-semibold text-brand">{errors.desc}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          <div className="mb-3.5">
            <label className={fieldLabel} htmlFor="burger-price">
              Price (&#8369;)
            </label>
            <input
              className={fieldInput}
              id="burger-price"
              type="number"
              min={1}
              step="0.01"
              value={form.price}
              onChange={(event) => set('price', event.target.value)}
            />
          </div>
          <div className="mb-3.5">
            <label className={fieldLabel} htmlFor="burger-stock">
              Stock
            </label>
            <input
              className={fieldInput}
              id="burger-stock"
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(event) => set('stock', event.target.value)}
            />
          </div>
          <div className="mb-3.5">
            <label className={fieldLabel} htmlFor="burger-rating">
              Rating
            </label>
            <input
              className={fieldInput}
              id="burger-rating"
              type="number"
              min={1}
              max={5}
              step="0.1"
              value={form.rating}
              onChange={(event) => set('rating', event.target.value)}
            />
          </div>
        </div>
        {(errors.price || errors.stock || errors.rating) && (
          <p className="mt-1.5 text-xs font-semibold text-brand">
            {errors.price || errors.stock || errors.rating}
          </p>
        )}

        <label className="mb-4 flex items-center gap-2.5 text-[13px] font-semibold text-[#3a3a3a]">
          <input
            className="h-4 w-4 accent-brand"
            type="checkbox"
            checked={form.featured}
            onChange={(event) => set('featured', event.target.checked)}
          />
          Show on the Feature page
        </label>

        {form.price && Number(form.price) > 0 && !errors.price && (
          <p className="mt-1.5 text-[11px] text-[#9a9a9a]">
            Price preview: {money(Number(form.price))}
          </p>
        )}

        <div className="mt-1.5 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-lg border border-[#e0e0e0] bg-white px-5 py-3 text-sm font-bold text-[#3a3a3a] transition hover:border-tangerine hover:text-tangerine"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className={primaryButton + ' flex-1'}>
            Save burger
          </button>
        </div>
      </form>
    </div>
  )
}
