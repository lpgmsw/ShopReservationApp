import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/user/Sidebar'

describe('User Sidebar Component', () => {
  describe('Click behavior', () => {
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
  })

  describe('Hover behavior', () => {
    it('閉じている時にマウスホバーで一時的に開く', () => {
      render(<Sidebar />)
      const sidebar = screen.getByRole('complementary')

      // Initially closed
      expect(sidebar).toHaveClass('w-16')

      // Mouse enter
      fireEvent.mouseEnter(sidebar)
      expect(sidebar).toHaveClass('w-64')
      expect(screen.getByText('マイページ')).toBeInTheDocument()
    })

    it('マウスが離れると元の状態に戻る', () => {
      render(<Sidebar />)
      const sidebar = screen.getByRole('complementary')

      // Mouse enter
      fireEvent.mouseEnter(sidebar)
      expect(sidebar).toHaveClass('w-64')

      // Mouse leave
      fireEvent.mouseLeave(sidebar)
      expect(sidebar).toHaveClass('w-16')
      expect(screen.queryByText('マイページ')).not.toBeInTheDocument()
    })

    it('クリックで開いている時はマウスが離れても閉じない', () => {
      render(<Sidebar />)
      const sidebar = screen.getByRole('complementary')
      const toggleButton = screen.getByRole('button', { name: /メニューを開く/ })

      // Click to open permanently
      fireEvent.click(toggleButton)
      expect(sidebar).toHaveClass('w-64')

      // Mouse leave should not close it
      fireEvent.mouseLeave(sidebar)
      expect(sidebar).toHaveClass('w-64')
      expect(screen.getByText('マイページ')).toBeInTheDocument()
    })

    it('ホバー中にクリックすると永続的に開く', () => {
      render(<Sidebar />)
      const sidebar = screen.getByRole('complementary')

      // Hover to open temporarily
      fireEvent.mouseEnter(sidebar)
      expect(sidebar).toHaveClass('w-64')

      // Click while hovering
      const toggleButton = screen.getByRole('button', { name: /メニューを閉じる/ })
      fireEvent.click(toggleButton)

      // Should remain open after mouse leave
      fireEvent.mouseLeave(sidebar)
      expect(sidebar).toHaveClass('w-64')
      expect(screen.getByText('マイページ')).toBeInTheDocument()
    })
  })

  describe('Navigation links', () => {
    it('マイページリンクが正しいURLを持つ', () => {
      render(<Sidebar />)

      // Open sidebar to make link text visible
      const toggleButton = screen.getByRole('button', { name: /メニューを開く/ })
      fireEvent.click(toggleButton)

      const mypageLink = screen.getByRole('link', { name: /マイページ/i })
      expect(mypageLink).toHaveAttribute('href', '/user/mypage')
    })

    it('予約履歴リンクが正しいURLを持つ', () => {
      render(<Sidebar />)

      // Open sidebar to make link text visible
      const toggleButton = screen.getByRole('button', { name: /メニューを開く/ })
      fireEvent.click(toggleButton)

      const reservationsLink = screen.getByRole('link', { name: /予約履歴/i })
      expect(reservationsLink).toHaveAttribute('href', '/user/reservations')
    })

    it('ユーザー設定リンクが正しいURLを持つ', () => {
      render(<Sidebar />)

      // Open sidebar to make link text visible
      const toggleButton = screen.getByRole('button', { name: /メニューを開く/ })
      fireEvent.click(toggleButton)

      const settingsLink = screen.getByRole('link', { name: /ユーザー設定/i })
      expect(settingsLink).toHaveAttribute('href', '/user/settings')
    })

    it('サイドバーが開いている時にマイページリンクが表示される', () => {
      render(<Sidebar />)

      const toggleButton = screen.getByRole('button', { name: /メニューを開く|メニューを閉じる/ })
      fireEvent.click(toggleButton)

      expect(screen.getByText('マイページ')).toBeInTheDocument()
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

    it('サイドバーが閉じている時はテキストが表示されない', () => {
      render(<Sidebar />)

      expect(screen.queryByText('マイページ')).not.toBeInTheDocument()
      expect(screen.queryByText('予約履歴')).not.toBeInTheDocument()
      expect(screen.queryByText('ユーザー設定')).not.toBeInTheDocument()
    })
  })
})
