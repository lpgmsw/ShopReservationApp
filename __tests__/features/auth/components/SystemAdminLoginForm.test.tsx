import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SystemAdminLoginForm } from '@/features/auth/components/SystemAdminLoginForm'

describe('SystemAdminLoginForm', () => {
  it('renders all form fields', () => {
    render(<SystemAdminLoginForm onSuccess={() => {}} />)

    expect(screen.getByLabelText(/ユーザー名またはメールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<SystemAdminLoginForm onSuccess={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/ユーザー名を入力してください/i)).toBeInTheDocument()
    })
  })

  it('renders submit button', () => {
    render(<SystemAdminLoginForm onSuccess={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })
})
