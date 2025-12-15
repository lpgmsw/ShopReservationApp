import { render, screen } from '@testing-library/react'
import SignUpPage from '@/app/user/signup/page'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

describe('User SignUp Page', () => {
  it('renders signup page with form', () => {
    render(<SignUpPage />)

    expect(screen.getByRole('heading', { name: /アカウント登録/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/ユーザー名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
  })

  it('displays login link text', () => {
    render(<SignUpPage />)

    expect(screen.getByText(/すでにアカウントをお持ちですか？/i)).toBeInTheDocument()
    expect(screen.getByText(/ログイン/i)).toBeInTheDocument()
  })
})
