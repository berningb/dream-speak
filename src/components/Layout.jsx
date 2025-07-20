import Menu from './Menu'

export default function Layout ({ children }) {
  return (
    <div className='bg-base-100'>
      <Menu />
      <div className='border-b border-gray-300' /> {/* Add this line */}
      <div className='content px-8 py-4'>{children}</div>
    </div>
  )
}
