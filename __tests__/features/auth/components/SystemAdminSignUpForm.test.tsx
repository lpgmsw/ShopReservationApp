import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SystemAdminSignUpForm } from '@/features/auth/components/SystemAdminSignUpForm'

describe('SystemAdminSignUpForm', () => {
  it('renders all form fields', () => {
    render(<SystemAdminSignUpForm onSuccess={() => {}} />)

    expect(screen.getByLabelText(/ユーザー名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登録/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<SystemAdminSignUpForm onSuccess={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /登録/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/ユーザー名は3文字以上/i)).toBeInTheDocument()
    })
  })

  it('shows link to login page if callback provided', () => {
    const mockSwitchToLogin = jest.fn()
    render(<SystemAdminSignUpForm onSuccess={() => {}} onSwitchToLogin={mockSwitchToLogin} />)

    expect(screen.getByText(/すでにアカウントをお持ちですか？/i)).toBeInTheDocument()
    expect(screen.getByText(/ログイン/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<SystemAdminSignUpForm onSuccess={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /登録/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })
})
