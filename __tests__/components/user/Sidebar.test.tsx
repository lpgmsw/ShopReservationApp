import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/user/Sidebar'

describe('User Sidebar Component', () => {
  it('サイドバーが初期状態で閉じている', () => {
    render(<Sidebar />)

    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('w-16')
  })

  it('トグルボタンをクリックするとサイドバーが開く', () => {
    render(<Sidebar />)

    const toggleButton = screen.getByRole('button', { name: /メニューを開く|メニューを閉じる/ })
    fireEvent.click(toggleButton)

    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('w-64')
  })

  it('トグルボタンを2回クリックするとサイドバーが閉じる', () => {
    render(<Sidebar />)

    const toggleButton = screen.getByRole('button', { name: /メニューを開く|メニューを閉じる/ })

    // 1回目: 開く
    fireEvent.click(toggleButton)
    let sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('w-64')

    // 2回目: 閉じる
    fireEvent.click(toggleButton)
    sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('w-16')
  })

  it('サイドバーが開いている時に予約履歴リンクが表示される', () => {
    render(<Sidebar />)

    const toggleButton = screen.getByRole('button', { name: /メニューを開く|メニューを閉じる/ })
    fireEvent.click(toggleButton)

    expect(screen.getByText('予約履歴')).toBeInTheDocument()
  })

  it('サイドバーが開いている時にユーザー設定リンクが表示される', () => {
    render(<Sidebar />)

    const toggleButton = screen.getByRole('button', { name: /メニューを開く|メニューを閉じる/ })
    fireEvent.click(toggleButton)

    expect(screen.getByText('ユーザー設定')).toBeInTheDocument()
  })

  it('ユーザー設定リンクが正しいURLを持つ', () => {
    render(<Sidebar />)

    const settingsLink = screen.getByRole('link', { name: /ユーザー設定/i })
    expect(settingsLink).toHaveAttribute('href', '/user/settings')
  })

  it('予約履歴リンクが正しいURLを持つ', () => {
    render(<Sidebar />)

    const reservationsLink = screen.getByRole('link', { name: /予約履歴/i })
    expect(reservationsLink).toHaveAttribute('href', '/user/reservations')
  })

  it('サイドバーが閉じている時はテキストが表示されない', () => {
    render(<Sidebar />)

    expect(screen.queryByText('予約履歴')).not.toBeInTheDocument()
    expect(screen.queryByText('ユーザー設定')).not.toBeInTheDocument()
  })
})
