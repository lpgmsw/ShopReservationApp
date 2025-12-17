import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/user/Footer'

describe('User Footer Component', () => {
  it('フッターテキストが表示される', () => {
    render(<Footer />)

    expect(screen.getByText('店舗予約システム')).toBeInTheDocument()
    expect(screen.getByText(/© 2025 店舗予約システム. All rights reserved./)).toBeInTheDocument()
  })

  it('ユーザー向けマイページという文言が表示される', () => {
    render(<Footer />)

    expect(screen.getByText('ユーザー向けマイページ')).toBeInTheDocument()
  })
})
