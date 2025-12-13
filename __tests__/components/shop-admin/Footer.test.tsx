import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/shop-admin/Footer'

describe('Footer', () => {
  it('コンポーネントが正しくレンダリングされる', () => {
    render(<Footer />)

    expect(screen.getByText('店舗予約システム')).toBeInTheDocument()
    expect(screen.getByText(/© 2025/)).toBeInTheDocument()
  })

  it('フッターに適切なクラスが適用されている', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')

    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('bg-gray-100', 'border-t')
  })
})
