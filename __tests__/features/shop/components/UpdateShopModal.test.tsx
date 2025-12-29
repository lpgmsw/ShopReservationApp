import { render, screen, fireEvent } from '@testing-library/react'
import { UpdateShopModal } from '@/features/shop/components/UpdateShopModal'

describe('UpdateShopModal Component', () => {
  const mockOnConfirm = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('モーダルが正しく表示される', () => {
    render(
      <UpdateShopModal
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('更新しますか？')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument()
  })

  it('キャンセルボタンをクリックするとonCancelが呼ばれる', () => {
    render(
      <UpdateShopModal
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('更新ボタンをクリックするとonConfirmが呼ばれる', () => {
    render(
      <UpdateShopModal
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const confirmButton = screen.getByRole('button', { name: '更新' })
    fireEvent.click(confirmButton)

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    expect(mockOnCancel).not.toHaveBeenCalled()
  })
})
