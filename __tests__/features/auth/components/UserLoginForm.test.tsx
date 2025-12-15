import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserLoginForm } from '@/features/auth/components/UserLoginForm'

describe('UserLoginForm', () => {
  it('renders all form fields', () => {
    render(<UserLoginForm onSuccess={() => {}} />)

    expect(screen.getByLabelText(/ユーザー名またはメールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<UserLoginForm onSuccess={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/ユーザー名を入力してください/i)).toBeInTheDocument()
    })
  })

  it('renders submit button', () => {
    render(<UserLoginForm onSuccess={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })
})
