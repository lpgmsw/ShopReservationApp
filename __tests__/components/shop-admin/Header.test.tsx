import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/shop-admin/Header'
import { useRouter } from 'next/navigation'

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// signOutのモック
jest.mock('@/features/auth/utils/signOut', () => ({
  signOut: jest.fn(),
}))

import { signOut } from '@/features/auth/utils/signOut'

describe('Header', () => {
  const mockPush = jest.fn()
  const mockRouter = {
    push: mockPush,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('アカウント名が表示される', () => {
    render(<Header userName="テストユーザー" />)

    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
  })

  it('店舗設定ボタンが表示される', () => {
    render(<Header userName="テストユーザー" />)

    expect(screen.getByRole('button', { name: '店舗設定' })).toBeInTheDocument()
  })

  it('ログアウトボタンが表示される', () => {
    render(<Header userName="テストユーザー" />)

    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument()
  })

  it('店舗設定ボタンをクリックすると店舗設定画面に遷移する', () => {
    render(<Header userName="テストユーザー" />)

    const shopSettingButton = screen.getByRole('button', { name: '店舗設定' })
    fireEvent.click(shopSettingButton)

    expect(mockPush).toHaveBeenCalledWith('/shop-admin/shop-settings')
  })

  it('ログアウトボタンをクリックするとログアウト処理が実行される', async () => {
    (signOut as jest.Mock).mockResolvedValue({ success: true })

    render(<Header userName="テストユーザー" />)

    const logoutButton = screen.getByRole('button', { name: 'ログアウト' })
    fireEvent.click(logoutButton)

    // signOutが呼ばれることを確認
    expect(signOut).toHaveBeenCalled()
  })

  it('ログアウト成功後、サインアップ画面に遷移する', async () => {
    (signOut as jest.Mock).mockResolvedValue({ success: true })

    render(<Header userName="テストユーザー" />)

    const logoutButton = screen.getByRole('button', { name: 'ログアウト' })
    fireEvent.click(logoutButton)

    // 非同期処理の完了を待つ
    await screen.findByRole('button', { name: 'ログアウト' })

    // ログアウト成功後に遷移することを確認
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(mockPush).toHaveBeenCalledWith('/shop-admin/signup')
  })
})
