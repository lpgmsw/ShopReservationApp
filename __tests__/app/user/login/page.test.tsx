import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/user/login/page'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

describe('User Login Page', () => {
  it('renders login page with form', () => {
    render(<LoginPage />)

    expect(screen.getByRole('heading', { name: /ログイン/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/ユーザー名またはメールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
  })

  it('displays signup link text', () => {
    render(<LoginPage />)

    expect(screen.getByText(/アカウントをお持ちでない方は/i)).toBeInTheDocument()
    expect(screen.getByText(/新規登録/i)).toBeInTheDocument()
  })
})
