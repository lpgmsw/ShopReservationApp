import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '@/features/auth/components/SignUpForm'

describe('SignUpForm', () => {
  it('renders all form fields', () => {
    render(<SignUpForm onSuccess={() => {}} />)

    expect(screen.getByLabelText(/ユーザー名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登録/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<SignUpForm onSuccess={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /登録/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/ユーザー名は3文字以上/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<SignUpForm onSuccess={() => {}} />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', { name: /登録/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/正しいメールアドレス形式/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    const user = userEvent.setup()
    render(<SignUpForm onSuccess={() => {}} />)

    const usernameInput = screen.getByLabelText(/ユーザー名/i)
    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /登録/i })

    await user.type(usernameInput, 'testuser')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
  })
})
