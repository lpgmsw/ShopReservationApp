import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/user/Header'
import { signOut } from '@/features/auth/utils/signOut'

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/features/auth/utils/signOut', () => ({
  signOut: jest.fn(),
}))

describe('User Header Component', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('ユーザー名が表示される', () => {
    render(<Header userName="テストユーザー" />)

    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
  })

  it('ログアウトボタンが表示される', () => {
    render(<Header userName="テストユーザー" />)

    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument()
  })

  it('ログアウトボタンをクリックするとログアウト処理が実行される', async () => {
    ;(signOut as jest.Mock).mockResolvedValue({ success: true })

    render(<Header userName="テストユーザー" />)

    const logoutButton = screen.getByRole('button', { name: 'ログアウト' })
    fireEvent.click(logoutButton)

    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('ログアウト成功時にユーザー登録画面へ遷移する', async () => {
    ;(signOut as jest.Mock).mockResolvedValue({ success: true })

    render(<Header userName="テストユーザー" />)

    const logoutButton = screen.getByRole('button', { name: 'ログアウト' })
    fireEvent.click(logoutButton)

    // 非同期処理を待つ
    await screen.findByRole('button', { name: 'ログアウト' })

    expect(mockPush).toHaveBeenCalledWith('/user/signup')
  })
})
