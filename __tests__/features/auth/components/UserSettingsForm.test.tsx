import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserSettingsForm } from '@/features/auth/components/UserSettingsForm'
import { updateUserInfo } from '@/features/auth/utils/userAuth'

jest.mock('@/features/auth/utils/userAuth')

const mockUpdateUserInfo = updateUserInfo as jest.MockedFunction<typeof updateUserInfo>

describe('UserSettingsForm', () => {
  const mockUserId = 'test-user-id'
  const mockDefaultValues = {
    userName: 'testuser',
    email: 'test@example.com',
  }
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the form with default values', () => {
    render(
      <UserSettingsForm
        userId={mockUserId}
        defaultValues={mockDefaultValues}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const userNameInput = screen.getByLabelText('ユーザー名')
    const emailInput = screen.getByLabelText('メールアドレス')

    expect(userNameInput).toHaveValue('testuser')
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should display validation error for invalid userName', async () => {
    const user = userEvent.setup()
    render(
      <UserSettingsForm
        userId={mockUserId}
        defaultValues={{ userName: 'ab', email: 'test@example.com' }}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByRole('button', { name: '保存' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('ユーザー名は3文字以上で入力してください')).toBeInTheDocument()
    })

    expect(mockUpdateUserInfo).not.toHaveBeenCalled()
  })

  it('should call updateUserInfo and onSuccess on valid submission', async () => {
    mockUpdateUserInfo.mockResolvedValue({ success: true })

    const user = userEvent.setup()
    render(
      <UserSettingsForm
        userId={mockUserId}
        defaultValues={mockDefaultValues}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const userNameInput = screen.getByLabelText('ユーザー名')
    const emailInput = screen.getByLabelText('メールアドレス')

    await user.clear(userNameInput)
    await user.type(userNameInput, 'newusername')
    await user.clear(emailInput)
    await user.type(emailInput, 'newemail@example.com')

    const submitButton = screen.getByRole('button', { name: '保存' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(mockUserId, {
        userName: 'newusername',
        email: 'newemail@example.com',
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('should display error message on update failure', async () => {
    mockUpdateUserInfo.mockResolvedValue({
      success: false,
      error: 'ユーザー情報の更新に失敗しました',
    })

    const user = userEvent.setup()
    render(
      <UserSettingsForm
        userId={mockUserId}
        defaultValues={mockDefaultValues}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByRole('button', { name: '保存' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('ユーザー情報の更新に失敗しました')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <UserSettingsForm
        userId={mockUserId}
        defaultValues={mockDefaultValues}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
    expect(mockUpdateUserInfo).not.toHaveBeenCalled()
  })

  it('should disable buttons while loading', async () => {
    mockUpdateUserInfo.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    )

    const user = userEvent.setup()
    render(
      <UserSettingsForm
        userId={mockUserId}
        defaultValues={mockDefaultValues}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByRole('button', { name: '保存' })
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })

    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeDisabled()
    })
  })
})
