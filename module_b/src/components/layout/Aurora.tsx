/** Декоративный «северное сияние» фон: размытые градиентные пятна, медленно плавающие. */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] animate-aurora rounded-full blur-3xl" style={{ background: 'var(--aurora-1)' }} />
      <div className="absolute top-1/4 -right-40 h-[30rem] w-[30rem] animate-aurora rounded-full blur-3xl [animation-delay:-7s]" style={{ background: 'var(--aurora-2)' }} />
      <div className="absolute -bottom-48 left-1/3 h-[28rem] w-[28rem] animate-aurora rounded-full blur-3xl [animation-delay:-13s]" style={{ background: 'var(--aurora-3)' }} />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(color-mix(in oklab, var(--c-ink) 14%, transparent) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'linear-gradient(to bottom, black, transparent 70%)',
        }}
      />
    </div>
  )
}
