export default function Stars({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <span className="text-[15px] tracking-[1px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? 'text-gold' : 'text-[#d8d8d8]'}>
          &#9733;
        </span>
      ))}
    </span>
  )
}
