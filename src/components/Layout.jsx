import Menu from './Menu'

export default function Layout ({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Dreamy floating background shapes for all pages */}
      <div className="fixed inset-0 z-[-10] pointer-events-none">
        {/* 8 unique floating circles with different animations, sizes, and delays */}
        <div className="absolute animate-float-primary-pulse-subtle w-[420px] h-[420px] rounded-full blur-3xl bg-primary animation-delay-0" />
        <div className="absolute animate-float-secondary-pulse-subtle w-[350px] h-[350px] rounded-full blur-3xl bg-secondary animation-delay-500" />
        <div className="absolute animate-float-accent-pulse-subtle w-[580px] h-[580px] rounded-full blur-2xl bg-accent animation-delay-1000" />
        <div className="absolute animate-float-base-pulse-subtle w-[580px] h-[580px] rounded-full blur-2xl bg-base-200 animation-delay-1500" />
        <div className="absolute animate-float-alt1-pulse-subtle w-[580px] h-[580px] rounded-full blur-2xl bg-primary animation-delay-2000" />
        <div className="absolute animate-float-alt2-pulse-subtle w-[580px] h-[580px] rounded-full blur-xl bg-secondary animation-delay-2500" />
        <div className="absolute animate-float-alt3-pulse-subtle w-[580px] h-[580px] rounded-full blur-lg bg-accent animation-delay-3000" />
        <div className="absolute animate-float-alt4-pulse-subtle w-[580px] h-[580px] rounded-full blur bg-base-200 animation-delay-3500" />
      </div>
      <Menu />
      <div className='border-b border-gray-300' />
      <div className='content px-8 py-4'>{children}</div>
    </div>
  )
}
