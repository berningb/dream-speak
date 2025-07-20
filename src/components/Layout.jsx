import Menu from './Menu'

export default function Layout ({ children }) {
  return (
    <div className="relative min-h-screen">
      <Menu />
      <div className='border-b border-gray-300' />
      <div className='content px-8 py-4'>{children}</div>
    </div>
  )
}
